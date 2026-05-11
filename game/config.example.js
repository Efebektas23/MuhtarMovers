// Example configuration file
// Copy this file to config.js and add your actual API keys

const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    GOOGLE_MAPS_LIBRARIES: ['places'],
    GOOGLE_MAPS_REGION: 'US'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 