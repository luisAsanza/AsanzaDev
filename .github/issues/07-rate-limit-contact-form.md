# Add Client-side Rate Limiting to Contact Form
Labels: security,low
Severity: Low

Description:
The contact form submits to Formspree without client-side rate limiting. This may allow abuse or spam, and degrades user experience under repeated submits.

Remediation:
- Disable the submit button for a short cooldown (e.g., 10 seconds) after submission.
- Consider adding spam protections like reCAPTCHA or server-side rate limits if using a custom backend.
