import json
import urllib.request
import urllib.error

req = urllib.request.Request("http://localhost:5000/api/auth/login", data=json.dumps({"email": "arjun.k@gmail.com", "password": "User1234!"}).encode(), headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as response:
    login_data = json.loads(response.read().decode())
    token = login_data["data"]["access_token"]

req2 = urllib.request.Request("http://localhost:5000/api/social/feed?page=1&per_page=10", headers={"Authorization": f"Bearer {token}"})
try:
    with urllib.request.urlopen(req2) as response:
        pass
except urllib.error.HTTPError as e:
    with open("api_out.html", "w", encoding="utf-8") as f:
        f.write(e.read().decode())
