import urllib.request, urllib.error

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

url = 'https://cdn.tailwindcss.com'
req = urllib.request.Request(url, method='HEAD')
opener = urllib.request.build_opener(NoRedirect)
try:
    resp = opener.open(req)
    print('Status:', resp.status)
    print('Headers:')
    for k, v in resp.getheaders():
        print(k + ':', v)
except urllib.error.HTTPError as e:
    print('HTTPError:', e.code)
    try:
        for k, v in e.headers.items():
            print(k + ':', v)
    except Exception:
        pass
except Exception as e:
    print('Error:', e)
