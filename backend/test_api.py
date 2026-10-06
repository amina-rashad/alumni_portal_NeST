import json
import urllib.request
import urllib.error
import time

BASE_URL = "http://127.0.0.1:5001/api/auth"

def send_post(url, data):
    req = urllib.request.Request(url, json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            return response.getcode(), json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 500, str(e)

def run_tests():
    print("--- Test 1: Unregistered Email ---")
    status, data = send_post(f"{BASE_URL}/send-otp", {"email": "randomtest123@gmail.com"})
    print("Status:", status)
    assert status == 404

    print("\n--- Test 2 & 3: Registered Email, Cooldown & Limits ---")
    email = "noblesibi3@gmail.com"
    
    # Since cooldown is 60s, we wait if necessary
    print("Requesting fresh OTP (we might hit cooldown initially)...")
    status1, data1 = send_post(f"{BASE_URL}/send-otp", {"email": email})
    print("First request status:", status1)
    
    if status1 == 429:
        print("Cooldown hit! Waiting 60s to guarantee a fresh request...")
        time.sleep(61)
        status1, data1 = send_post(f"{BASE_URL}/send-otp", {"email": email})
        print("After wait, request status:", status1)
        assert status1 == 200, "Should be 200 after wait"

    print("Attempting immediate resend to test cooldown...")
    status2, data2 = send_post(f"{BASE_URL}/send-otp", {"email": email})
    print("Second request status:", status2)
    assert status2 == 429

    print("\nTesting Wrong OTP and Attempt Limits...")
    for i in range(1, 5):
        status, data = send_post(f"{BASE_URL}/login-otp", {"email": email, "otp": f"00000{i}"})
        print(f"Wrong OTP attempt {i} status:", status)
        if i < 4:
            assert status == 401, f"Expected 401, got {status}"
        else:
            assert status == 403, f"Expected 403, got {status}"

if __name__ == "__main__":
    run_tests()
    print("\nALL AUTOMATED TESTS PASSED!")
