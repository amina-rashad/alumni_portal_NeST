import requests

BASE_URL = "http://127.0.0.1:5000/api"

def test_apply():
    # Login first to get a token
    login_data = {
        "email": "admin@nest.com", # Assuming this exists or using a known user
        "password": "Password123"
    }
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
    
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get a job ID
    print("Fetching jobs...")
    jobs_res = requests.get(f"{BASE_URL}/jobs")
    jobs = jobs_res.json()["data"]["jobs"]
    if not jobs:
        print("No jobs found to apply for.")
        return
    
    job_id = jobs[0]["id"]
    print(f"Applying for job ID: {job_id}")
    
    # Try applying without trailing slash
    print("Testing POST /applications (no slash)...")
    res1 = requests.post(f"{BASE_URL}/applications", json={"job_id": job_id}, headers=headers)
    print(f"Status: {res1.status_code}")
    print(f"Body: {res1.text}")
    
    # Try applying with trailing slash
    print("\nTesting POST /applications/ (with slash)...")
    res2 = requests.post(f"{BASE_URL}/applications/", json={"job_id": job_id}, headers=headers)
    print(f"Status: {res2.status_code}")
    print(f"Body: {res2.text}")

if __name__ == "__main__":
    test_apply()
