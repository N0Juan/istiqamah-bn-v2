// Daily Hadith Module
const DailyHadith = {
    hadiths: [
        {
            text: "The most beloved deeds to Allah are those done consistently, even if they are small.",
            source: "Sahih al-Bukhari 6464"
        },
        {
            text: "Allah does not burden a soul beyond that it can bear.",
            source: "Quran 2:286"
        },
        {
            text: "Verily, with hardship comes ease.",
            source: "Quran 94:6"
        },
        {
            text: "The strong person is not the one who can overpower others, but the one who controls themselves when angry.",
            source: "Sahih al-Bukhari 6114"
        },
        {
            text: "When you see a person who has been given more than you in wealth and beauty, look to those who have been given less.",
            source: "Sahih Muslim 2963"
        },
        {
            text: "The best of people are those who are most beneficial to others.",
            source: "Sunan al-Daraqutni 4/228"
        },
        {
            text: "Whoever relieves a believer's distress, Allah will relieve them of distress on the Day of Resurrection.",
            source: "Sahih Muslim 2699"
        },
        {
            text: "The believer who mixes with people and bears their annoyance with patience will have a greater reward than the one who does not mix with people.",
            source: "Sunan Ibn Majah 4032"
        },
        {
            text: "Indeed, remembrance of Allah gives rest to the hearts.",
            source: "Quran 13:28"
        },
        {
            text: "None of you truly believes until he loves for his brother what he loves for himself.",
            source: "Sahih al-Bukhari 13"
        },
        {
            text: "The best charity is that given when one has little.",
            source: "Sunan Abu Dawud 1677"
        },
        {
            text: "Richness is not having many possessions, but richness is being content with oneself.",
            source: "Sahih al-Bukhari 6446"
        },
        {
            text: "Whoever would love to have their provision expanded and their lifespan extended, let them maintain family ties.",
            source: "Sahih al-Bukhari 5986"
        },
        {
            text: "A good word is charity.",
            source: "Sahih al-Bukhari 2989"
        },
        {
            text: "Your smile for your brother is a charity.",
            source: "Jami' at-Tirmidhi 1956"
        },
        {
            text: "The best of you are those who are best to their families.",
            source: "Jami' at-Tirmidhi 3895"
        },
        {
            text: "Be in this world as though you are a stranger or a traveler.",
            source: "Sahih al-Bukhari 6416"
        },
        {
            text: "Actions are judged by intentions, so each person will have what they intended.",
            source: "Sahih al-Bukhari 1"
        },
        {
            text: "The prayer is the pillar of religion.",
            source: "Sahih Ibn Hibban 1467"
        },
        {
            text: "Between a person and disbelief is abandoning the prayer.",
            source: "Sahih Muslim 82"
        },
        {
            text: "Seek knowledge from the cradle to the grave.",
            source: "Sunan Ibn Majah 224"
        },
        {
            text: "The one who guides to something good has a reward similar to that of its doer.",
            source: "Sahih Muslim 1893"
        },
        {
            text: "Make things easy and do not make them difficult, cheer people up and do not repel them.",
            source: "Sahih al-Bukhari 69"
        },
        {
            text: "The most complete of the believers in faith are those with the best character.",
            source: "Jami' at-Tirmidhi 1162"
        },
        {
            text: "Do not be people without minds of your own, saying that if others treat you well you will treat them well. Instead, decide that you will treat people well regardless of how they treat you.",
            source: "Jami' at-Tirmidhi 2007"
        },
        {
            text: "When Allah loves a servant, He calls Jibreel and says: 'I love so-and-so, so love him.' Then Jibreel loves him. After that, Jibreel announces to the inhabitants of the heavens, 'Allah loves so-and-so, so love him,' and the inhabitants of the heavens love him and he is granted acceptance on earth.",
            source: "Sahih al-Bukhari 3209"
        },
        {
            text: "Whoever Allah wishes good for, He grants them understanding of the religion.",
            source: "Sahih al-Bukhari 71"
        },
        {
            text: "The believer's shade on the Day of Resurrection will be their charity.",
            source: "Musnad Ahmad 17333"
        },
        {
            text: "There is a polish for everything that becomes rusty, and the polish for hearts is the remembrance of Allah.",
            source: "Sharh as-Sunnah 1280"
        },
        {
            text: "Allah is with those who restrain themselves and those who do good.",
            source: "Quran 16:128"
        }
    ],

    init() {
        this.displayTodaysHadith();
    },

    // Get hadith index based on day of year
    getTodaysIndex() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Cycle through hadiths
        return dayOfYear % this.hadiths.length;
    },

    displayTodaysHadith() {
        const index = this.getTodaysIndex();
        const hadith = this.hadiths[index];

        const textEl = document.getElementById('hadith-text');
        const sourceEl = document.getElementById('hadith-source');

        if (textEl && sourceEl) {
            textEl.textContent = hadith.text;
            sourceEl.textContent = hadith.source;
        }
    }
};
