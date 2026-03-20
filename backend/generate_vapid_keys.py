#!/usr/bin/env python3
"""Generate VAPID keys for Web Push notifications.

Run this once and add the output to your .env or docker-compose.yml.
"""
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization
import base64


def generate_vapid_keys():
    private_key = ec.generate_private_key(ec.SECP256R1())

    # Raw private key (32 bytes, base64url-encoded)
    private_numbers = private_key.private_numbers()
    private_bytes = private_numbers.private_value.to_bytes(32, byteorder='big')
    private_b64 = base64.urlsafe_b64encode(private_bytes).decode().rstrip('=')

    # Raw public key (65 bytes uncompressed point, base64url-encoded)
    public_key = private_key.public_key()
    public_bytes = public_key.public_bytes(
        serialization.Encoding.X962,
        serialization.PublicFormat.UncompressedPoint,
    )
    public_b64 = base64.urlsafe_b64encode(public_bytes).decode().rstrip('=')

    return private_b64, public_b64


if __name__ == '__main__':
    private_key, public_key = generate_vapid_keys()
    print(f"VAPID_PRIVATE_KEY={private_key}")
    print(f"VAPID_PUBLIC_KEY={public_key}")
    print(f"VAPID_CONTACT=mailto:admin@istiqamahbn.com")
    print()
    print("Add these to your .env file or docker-compose.yml environment variables.")
