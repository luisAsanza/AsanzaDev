Suggested 301 redirect rules to ensure only canonical URLs are indexed

Nginx (add to server block):

```
location = /index.html {
  return 301 https://$host/;
}

# Optional: ensure requests to /index.html?query are redirected too
rewrite ^/index\.html(.*)$ https://$host/$1 permanent;
```

Apache (in .htaccess or vhost):

```
RedirectMatch 301 ^/index\.html$ /

# Preserve query string
RewriteEngine On
RewriteCond %{THE_REQUEST} /index\.html [NC]
RewriteRule ^index\.html$ / [R=301,L,QSA]
```

Netlify (_redirects file):

```
/index.html  /  301!
```

GitHub Pages
- GitHub Pages doesn't support server redirects via config. To avoid duplicate URLs, ensure your build/output and sitemap do not include `/index.html` entries. If you're using a hosting layer in front (Cloudflare Workers, CDN), implement a redirect there.

Notes:
- After applying redirects and updating `sitemap.xml`, re-submit the sitemap in Google Search Console and request indexing for fastest resolution.
