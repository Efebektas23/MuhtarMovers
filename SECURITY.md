# Security Policy

## API Key Security

This project uses Google Maps API keys which are visible in the client-side code. To ensure security:

1.  **HTTP Referrer Restrictions**: You **MUST** restrict the API key in the Google Cloud Console to only allow requests from your specific domains (e.g., `muhtar.ca`, `muhtar.us`).
2.  **API Restrictions**: Restrict the key to only use the specific APIs needed (Maps JavaScript API, Places API, Geocoding API, Distance Matrix API).
3.  **Billing Alerts**: Set up budget alerts in Google Cloud to notify you of unexpected usage spikes.

## Reporting Vulnerabilities

If you discover a security vulnerability, please do NOT open a public issue. Instead, contact the development team directly at `moving@muhtar.ca`.

## Configuration

Never commit `config.js` to version control if it contains secret server-side keys. The current `config.js` is intended for client-side configuration, but still requires the restrictions mentioned above.
