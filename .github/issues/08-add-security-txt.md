# Add `.well-known/security.txt` for Vulnerability Disclosure
Labels: security,low
Severity: Low

Description:
No `security.txt` is present to provide contact and disclosure instructions for security researchers.

Remediation:
- Add `.well-known/security.txt` with contact email, expiry, preferred languages, and canonical URL. Example:
  ```
  Contact: mailto:security@asanzadev.com
  Expires: 2027-12-31T23:59:59.000Z
  Preferred-Languages: en, es
  Canonical: https://asanzadev.com/.well-known/security.txt
  ```

References:
- https://securitytxt.org/
