# Validate URLs in `buildDetailsUrl` to Prevent XSS-like Injection
Labels: security,low
Severity: Low

Description:
The `buildDetailsUrl(u)` function in `js/main.js` concatenates user-supplied data into URLs without robust validation. If JSON data is compromised, malicious URLs could be injected.

Remediation:
- Validate and sanitize input using the `URL` constructor and ensure allowed protocols (`http:`/`https:`). Example:
  ```js
  try {
    const url = new URL(u, 'https://learn.microsoft.com/en-us');
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.href;
  } catch (e) { /* invalid */ }
  ```
- Add logging and unit tests around URL-building behavior.

References:
- https://developer.mozilla.org/en-US/docs/Web/API/URL
