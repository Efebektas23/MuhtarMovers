// Main Site Configuration Example
// Copy this file to config.js and add your actual API keys and sensitive data
// NEVER commit config.js to version control

const CONFIG = {
    // Google Maps API Configuration
    GOOGLE_MAPS: {
        API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
        LIBRARIES: ['places', 'geometry'],
        REGION: 'US',
        LANGUAGE: 'en'
    },
    
    // Contact Information (can be customized per environment)
    CONTACT: {
        PHONE: '+1 (778) 348-2208',
        EMAIL: 'moving@muhtar.ca',
        WHATSAPP: '905333022974',
        OFFICES: {
            CANADA: 'Vancouver, BC',
            USA: 'Orlando, FL'
        }
    },
    
    // Form Configuration
    FORMS: {
        ENABLE_ANALYTICS: false,
        ENABLE_CAPTCHA: false,
        CAPTCHA_SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY_HERE'
    },
    
    // Development/Production Settings
    ENVIRONMENT: {
        DEBUG: true,
        API_TIMEOUT: 5000,
        ENABLE_CONSOLE_LOGS: true
    }
};

// Security Note: This configuration should be loaded securely
// For production, consider using environment variables or a secure backend endpoint

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 