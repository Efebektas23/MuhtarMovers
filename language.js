document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.querySelector('.language-switcher');
    if (!languageSwitcher) return;
    const dropdown = languageSwitcher.querySelector('.language-dropdown');
    const selectedLanguage = languageSwitcher.querySelector('.selected-language');

    const setLanguage = (lang) => {
        // Translate all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                element.innerHTML = translations[lang][key];
            } else if (translations['en'] && translations['en'][key]) {
                element.innerHTML = translations['en'][key]; // Fallback to English
            }
        });

        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (translations[lang] && translations[lang][key]) {
                element.placeholder = translations[lang][key];
            } else if (translations['en'] && translations['en'][key]) {
                element.placeholder = translations['en'][key]; // Fallback to English
            }
        });

        // Update the selected language display
        const selectedLanguageDisplay = languageSwitcher.querySelector('.selected-language span');
        const selectedLanguageFlag = languageSwitcher.querySelector('.selected-language img');
        if (selectedLanguageDisplay) {
            selectedLanguageDisplay.textContent = lang.toUpperCase();
        }
        if (selectedLanguageFlag) {
            const flagCode = lang === 'en' ? 'us' : (lang === 'zh' ? 'cn' : lang);
            selectedLanguageFlag.src = `https://cdn.jsdelivr.net/gh/lipis/flag-icon-css@3.5.0/flags/4x3/${flagCode}.svg`;
            selectedLanguageFlag.alt = lang;
        }

        // Store language preference
        localStorage.setItem('language', lang);
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
        
        // Close dropdown after selection
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    };

    // --- New Click-based Logic ---
    selectedLanguage.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to the document
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        // Close dropdown if clicked outside
        dropdown.style.display = 'none';
    });

    // Initialize language switcher
    const savedLang = localStorage.getItem('language') || 'en';

    languageSwitcher.querySelectorAll('.language-dropdown a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent document click listener from firing
            const lang = a.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
    
    // Set initial language on page load
    setLanguage(savedLang);
}); 