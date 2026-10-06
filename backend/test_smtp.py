import os
from dotenv import load_dotenv
import smtplib

load_dotenv()

server = os.getenv("MAIL_SERVER")
port = int(os.getenv("MAIL_PORT", 587))
username = os.getenv("MAIL_USERNAME")
password = os.getenv("MAIL_PASSWORD")
use_tls = os.getenv("MAIL_USE_TLS", "true").lower() == "true"

print(f"Connecting to {server}:{port} as {username}")

try:
    smtp = smtplib.SMTP(server, port)
    smtp.set_debuglevel(1)
    if use_tls:
        print("Starting TLS...")
        smtp.starttls()
    
    print("Logging in...")
    smtp.login(username, password)
    print("SUCCESS: SMTP Authentication successful!")
    smtp.quit()
except smtplib.SMTPAuthenticationError as e:
    print(f"\nAUTH ERROR: {e}")
    print("This usually means the password is wrong, MFA is required (needs App Password), or SMTP Auth is disabled for this mailbox.")
except Exception as e:
    print(f"\nERROR: {e}")
