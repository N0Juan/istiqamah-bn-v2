"""Push notification subscription API routes."""
import hmac
import json
import logging
import os
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pywebpush import webpush, WebPushException

from app.api.models import (
    PushSubscriptionRequest,
    PushSettingsUpdateRequest,
    PushUnsubscribeRequest,
    PushSendRequest,
)
from app.database.db import get_db

logger = logging.getLogger(__name__)

security = HTTPBearer()

router = APIRouter(prefix="/api/v1/push", tags=["Push Notifications"])


def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify admin API key from the Authorization header."""
    admin_key = os.getenv("ADMIN_API_KEY", "")
    if not admin_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin authentication not configured",
        )
    if not hmac.compare_digest(credentials.credentials, admin_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin API key",
        )


# --- Public endpoints ---


@router.get("/vapid-public-key")
async def get_vapid_public_key():
    """Return the VAPID public key for browser push subscription."""
    public_key = os.getenv('VAPID_PUBLIC_KEY', '')
    if not public_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="VAPID keys not configured. Push notifications unavailable.",
        )
    return {"publicKey": public_key}


@router.post("/subscribe")
async def subscribe(request: PushSubscriptionRequest):
    """Store a push subscription with notification preferences."""
    try:
        db = get_db()
        db.add_push_subscription(
            endpoint=request.subscription.endpoint,
            p256dh=request.subscription.keys.p256dh,
            auth=request.subscription.keys.auth,
            district=request.settings.district,
            reminder_advance=request.settings.reminder_advance,
            end_reminders_enabled=request.settings.end_reminders_enabled,
            end_reminder_advance=request.settings.end_reminder_advance,
        )
        logger.info(f"Push subscription added: {request.subscription.endpoint[:60]}...")
        return {"status": "subscribed"}
    except Exception as e:
        logger.error(f"Subscribe error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/unsubscribe")
async def unsubscribe(request: PushUnsubscribeRequest):
    """Remove a push subscription."""
    db = get_db()
    db.remove_push_subscription(request.endpoint)
    logger.info(f"Push subscription removed: {request.endpoint[:60]}...")
    return {"status": "unsubscribed"}


@router.post("/update-settings")
async def update_settings(request: PushSettingsUpdateRequest):
    """Update notification preferences for an existing subscription."""
    try:
        db = get_db()
        db.update_push_settings(
            endpoint=request.endpoint,
            district=request.settings.district,
            reminder_advance=request.settings.reminder_advance,
            end_reminders_enabled=request.settings.end_reminders_enabled,
            end_reminder_advance=request.settings.end_reminder_advance,
        )
        logger.info(f"Push settings updated: {request.endpoint[:60]}...")
        return {"status": "updated"}
    except Exception as e:
        logger.error(f"Update settings error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- Admin-only endpoints ---


@router.get("/subscribers", dependencies=[Depends(verify_admin)])
async def list_subscribers():
    """List all push subscribers (admin only)."""
    db = get_db()
    subscriptions = db.get_all_push_subscriptions()

    subscribers = []
    for sub in subscriptions:
        endpoint = sub["endpoint"]
        try:
            parsed = urlparse(endpoint)
            domain = parsed.hostname or "unknown"
        except Exception:
            domain = "unknown"
        subscribers.append({
            "endpoint_preview": endpoint[:80] + "..." if len(endpoint) > 80 else endpoint,
            "domain": domain,
            "district": sub.get("district", "bruneiMuara"),
            "reminder_advance": sub.get("reminder_advance", 5),
            "created_at": sub.get("created_at", ""),
        })

    return {
        "count": len(subscribers),
        "subscribers": subscribers,
    }


@router.post("/send", dependencies=[Depends(verify_admin)])
async def send_push_notification(request: PushSendRequest):
    """Send a push notification to all subscribers (admin only)."""
    vapid_private_key = os.getenv("VAPID_PRIVATE_KEY", "")
    vapid_contact = os.getenv("VAPID_CONTACT", "")

    if not vapid_private_key or not vapid_contact:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VAPID credentials not configured",
        )

    db = get_db()
    subscriptions = db.get_all_push_subscriptions()

    if not subscriptions:
        return {"message": "No subscribers", "sent": 0, "failed": 0}

    payload = json.dumps({
        "title": request.title,
        "body": request.body,
        "url": request.url or "/",
    })

    vapid_claims = {"sub": vapid_contact}

    sent = 0
    failed = 0
    expired_endpoints = []

    for sub in subscriptions:
        subscription_info = {
            "endpoint": sub["endpoint"],
            "keys": {
                "p256dh": sub["p256dh"],
                "auth": sub["auth"],
            },
        }
        try:
            webpush(
                subscription_info=subscription_info,
                data=payload,
                vapid_private_key=vapid_private_key,
                vapid_claims=vapid_claims,
            )
            sent += 1
        except WebPushException as e:
            logger.error(f"Push failed for {sub['endpoint'][:50]}: {e}")
            if hasattr(e, "response") and e.response is not None and e.response.status_code in (404, 410):
                expired_endpoints.append(sub["endpoint"])
            failed += 1

    for endpoint in expired_endpoints:
        db.remove_push_subscription(endpoint)
        logger.info(f"Removed expired subscription: {endpoint[:50]}...")

    return {
        "message": f"Push sent to {sent} subscribers",
        "sent": sent,
        "failed": failed,
        "expired_removed": len(expired_endpoints),
    }
