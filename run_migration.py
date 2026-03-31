import urllib.request, json, sys

sql = open('supabase/migrations/20260331_cards_and_tiendanube.sql').read()
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdW90bGpnb3VrdXRicnhmbnZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU2ODg2NiwiZXhwIjoyMDkwMTQ0ODY2fQ.tttvJBrgM6-8iMtKpLDlDlzzvfu2bqmHVa2e0ugQXkA'

# Supabase Management API - execute SQL
url = 'https://api.supabase.com/v1/projects/jpuotljgoukutbrxfnvb/database/query'

data = json.dumps({'query': sql}).encode()
req = urllib.request.Request(url, data=data, headers={
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
}, method='POST')

try:
    with urllib.request.urlopen(req) as r:
        print('OK:', r.status)
        print(r.read().decode()[:300])
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print('HTTP Error:', e.code)
    print(body[:500])
