"""
Recruiter Management Routes
Provides endpoints for recruiters to manage jobs and applications.
Protected with JWT authentication and recruiter role check.
"""

from datetime import datetime, timezone
import uuid
from bson import ObjectId
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required
import bcrypt

from app import get_db
from .notifications import create_notification
from utils.mailer import broadcast_email, send_email
from .auth import _is_user_added_by_admin
from .applications import serialize_timeline
from utils.date_helpers import format_datetime_utc

recruiter_bp = Blueprint("recruiter", __name__)

def recruiter_required(fn):
    """Decorator to check if user has recruiter, admin, or super_admin role."""
    from functools import wraps
    from flask_jwt_extended import get_jwt
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        claims = {}
        try:
            claims = get_jwt() or {}
        except Exception:
            pass
        db = get_db()
        user = None
        try:
            user = db["users"].find_one({"_id": ObjectId(user_id)})
        except Exception:
            pass
        if not user:
            user = db["users"].find_one({"$or": [{"email": str(user_id).strip().lower()}, {"emp_id": str(user_id)}]})
        if not user and claims.get("email"):
            user = db["users"].find_one({"email": str(claims.get("email")).strip().lower()})
            
        allowed = ["job_recruiter", "recruiter", "admin", "super_admin"]
        role = ((user.get("role") if user else None) or claims.get("role") or "").strip().lower()
        user_type = user.get("user_type") if user else claims.get("user_type")
        
        print(f"DEBUG: recruiter_required - identity={user_id}, claims={claims}, found_user={bool(user)}, role={role}, type={user_type}", flush=True)
        
        if role not in allowed and user_type != "Staff":
            print(f"DEBUG: Access Denied for user {user_id}. Role: {role}", flush=True)
            return jsonify({"success": False, "message": "Recruiter or Admin privileges required."}), 403
            
        print(f"DEBUG: Access Granted for {user.get('full_name') if user else user_id} (Role: {role})", flush=True)
        return fn(*args, **kwargs)
    return wrapper


def normalize_college_name(name: str) -> str:
    if not name or str(name).strip().upper() in ("N/A", "NONE", "NULL", ""):
        return "Not Specified"
    cleaned = str(name).strip()
    if "saintgits" in cleaned.lower():
        return "Saintgits College of Engineering"
    
    words = cleaned.split()
    capitalized_words = []
    lower_words = {"of", "and", "in", "for", "the", "at"}
    for i, w in enumerate(words):
        if i > 0 and w.lower() in lower_words:
            capitalized_words.append(w.lower())
        else:
            capitalized_words.append(w.capitalize())
    return " ".join(capitalized_words)


def _is_valid_drive_link(link: str) -> bool:
    if not link or not isinstance(link, str):
        return False
    s = link.strip().lower()
    if s.startswith("data:") or s.endswith(".pdf") or s.endswith(".docx") or s.endswith(".doc"):
        return False
    return s.startswith("http://") or s.startswith("https://") or "drive.google.com" in s or "dropbox.com" in s or "onedrive." in s


def clean_repetitive_content(content):
    if not content or not isinstance(content, str):
        return content
    import re
    match = re.search(r'Personal Note:\s*"([\s\S]*?)"', content)
    if match:
        inner = match.group(1).strip()
        if inner.lower().startswith("dear ") and "update regarding your application" in inner.lower():
            lines = [
                l.strip() for l in inner.split("\n")
                if l.strip() and not l.strip().lower().startswith("dear ") and "update regarding your application" not in l.lower()
            ]
            clean_inner = "\n".join(lines).strip()
            if clean_inner:
                content = content.replace(match.group(0), f'Personal Note: "{clean_inner}"')
            else:
                content = content.replace(match.group(0), "").replace("\n\n\n", "\n\n").strip()
    return content


def serialize_email_history(history):
    """Serialize the email history array ensuring ISO UTC format for sent_at, newest first."""
    if not isinstance(history, list):
        return []
    serialized = []
    for item in history:
        if not isinstance(item, dict):
            continue
        entry = dict(item)
        if "sent_at" in entry and entry["sent_at"]:
            entry["sent_at"] = format_datetime_utc(entry["sent_at"])

        if entry.get("content"):
            entry["content"] = clean_repetitive_content(entry["content"])
        if entry.get("body"):
            entry["body"] = clean_repetitive_content(entry["body"])

        if not entry.get("content") and not entry.get("body"):
            c_name = entry.get("recipient_name") or "Candidate"
            j_title = entry.get("job_title") or "Position"
            s_to = entry.get("status_to") or "Applied"
            c_note = (entry.get("candidate_note") or "").strip()
            if c_note.lower().startswith("dear ") and "update regarding your application" in c_note.lower():
                c_lines = [l.strip() for l in c_note.split("\n") if l.strip() and not l.strip().lower().startswith("dear ") and "update regarding your application" not in l.lower()]
                c_note = "\n".join(c_lines).strip()

            s_by_name = (entry.get("sent_by") or {}).get("name") or "Recruiter"
            i_date = entry.get("interview_date")
            i_time = entry.get("interview_time")
            i_loc = entry.get("interview_location")

            guidance = {
                "Shortlisted": f"Congratulations! Your profile has been shortlisted for the {j_title} role. Our team was impressed with your credentials, and we are moving you forward to the next evaluation stage.",
                "Interview Scheduled": f"We are pleased to invite you for an interview for the {j_title} position. Please review the interview schedule and details below.",
                "Aptitude": f"You have been selected to proceed to the aptitude and skill assessment round for the {j_title} opportunity.",
                "Offered": f"Congratulations! We are delighted to inform you that you have been selected for employment for the {j_title} position at NeST Digital.",
                "Rejected": f"Thank you for your interest in the {j_title} role at NeST Digital. While we were impressed with your background, we have chosen to move forward with other candidates whose profiles align more closely with our requirements.",
                "Withdrawn": f"We acknowledge that your application for the {j_title} role at NeST Digital has been marked as Withdrawn."
            }.get(s_to, f"We wanted to share an update regarding your application for the {j_title} role at NeST Digital.")

            lines = [f"Dear {c_name},", "", guidance]
            if s_to == "Interview Scheduled" and i_date:
                lines.extend(["", f"Interview Schedule: {i_date} {i_time or ''} ({i_loc or 'Virtual'})"])
            if c_note:
                lines.extend(["", f'Personal Note: "{c_note}"'])
            lines.extend([
                "",
                "You can track the ongoing progress of all your applications anytime on your NDA Connect Candidate Portal.",
                "",
                "Warm regards,",
                s_by_name,
                "Talent Acquisition Team • NeST Digital"
            ])
            entry["content"] = "\n".join(lines)
            entry["body"] = entry["content"]

        serialized.append(entry)
    # Reverse so the newest email is always at index 0
    return list(reversed(serialized))


def build_status_email_content(candidate_name, job_title, company_name, job_location, prev_status, new_status, recruiter_name, interview_date=None, interview_time=None, interview_location=None, candidate_note=None):
    """Generates personalized plain text and responsive HTML email for application status change."""
    status_colors = {
        "Applied": "#64748b",
        "Aptitude": "#d97706",
        "Shortlisted": "#0284c7",
        "Interview Scheduled": "#7c3aed",
        "Offered": "#16a34a",
        "Rejected": "#dc2626",
        "Withdrawn": "#dc2626"
    }
    new_status_color = status_colors.get(new_status, "#0f172a")

    guidance_map = {
        "Shortlisted": f"Congratulations! Your profile has been shortlisted for the <strong>{job_title}</strong> role. Our talent acquisition team was impressed with your credentials, and we are moving you forward to the next evaluation stage.",
        "Interview Scheduled": f"We are pleased to invite you for an interview for the <strong>{job_title}</strong> position. Please review the interview schedule and details below.",
        "Aptitude": f"You have been selected to proceed to the aptitude and skill assessment round for the <strong>{job_title}</strong> opportunity.",
        "Offered": f"Congratulations! We are delighted to inform you that you have been selected for employment for the <strong>{job_title}</strong> position at {company_name}.",
        "Rejected": f"Thank you for your interest in the <strong>{job_title}</strong> role at {company_name} and for participating in our recruitment process. While we were impressed with your background, we have chosen to move forward with other candidates whose profiles align more closely with our current requirements.",
        "Withdrawn": f"We acknowledge that your application for the <strong>{job_title}</strong> role at {company_name} has been marked as <strong>Withdrawn</strong>. Thank you for your interest in NeST Digital, and please feel free to explore other openings with us in the future."
    }
    guidance_text = guidance_map.get(new_status, f"The status of your application for the <strong>{job_title}</strong> position has been updated.")

    interview_html = ""
    if new_status == "Interview Scheduled" and interview_date:
        time_display = f" • {interview_time}" if interview_time else ""
        loc_display = f"<div style='margin-top: 6px; font-size: 13px; color: #475569;'><strong>📍 Location / Mode:</strong> {interview_location or 'Virtual via Microsoft Teams / NeST Digital Tech Park'}</div>"
        interview_html = f"""
        <div style="background-color: #f5f3ff; border: 1.5px solid #c4b5fd; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
            <h4 style="margin: 0 0 8px 0; color: #6d28d9; font-size: 15px; font-weight: 700;">
                📅 Interview Schedule Details
            </h4>
            <div style="font-size: 14px; font-weight: 700; color: #1e1b4b;">
                Date & Time: {interview_date}{time_display}
            </div>
            {loc_display}
        </div>
        """

    clean_note = (candidate_note or "").strip()
    if clean_note.lower().startswith("dear ") and "update regarding your application" in clean_note.lower():
        note_lines = [
            l.strip() for l in clean_note.split("\n")
            if l.strip() and not l.strip().lower().startswith("dear ") and "update regarding your application" not in l.lower()
        ]
        clean_note = "\n".join(note_lines).strip()

    note_html = ""
    if clean_note:
        note_html = f"""
        <div style="background-color: #f8fafc; border-left: 4px solid #c8102e; border-radius: 4px 10px 10px 4px; padding: 14px 18px; margin: 20px 0;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 800; color: #c8102e; text-transform: uppercase; letter-spacing: 0.5px;">
                Note from Talent Acquisition Team ({recruiter_name})
            </p>
            <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.5; font-style: italic;">
                "{clean_note}"
            </p>
        </div>
        """

    html_body = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Application Status Update</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 35px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Top Branding Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: left; border-bottom: 3px solid #c8102e;">
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0;">
        NeST <span style="color: #c8102e;">Digital</span> • NDA Connect
      </h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
        Talent Acquisition Team
      </p>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 32px 30px;">
      <p style="font-size: 16px; margin: 0 0 14px 0; color: #0f172a;">
        Dear <strong>{candidate_name}</strong>,
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
        {guidance_text}
      </p>

      <!-- Status Transition Pill Display -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 10px;">
          Application Status
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="background-color: #e2e8f0; color: #475569; padding: 6px 14px; border-radius: 99px; font-weight: 700; font-size: 13px;">
            {prev_status}
          </span>
          <span style="color: #94a3b8; font-size: 16px; font-weight: 900;">➔</span>
          <span style="background-color: {new_status_color}15; color: {new_status_color}; border: 1.5px solid {new_status_color}; padding: 6px 16px; border-radius: 99px; font-weight: 800; font-size: 13px;">
            {new_status}
          </span>
        </div>
      </div>

      <!-- Job Role Card -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 18px 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
        <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 6px;">
          Position Details
        </div>
        <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #0f172a; font-weight: 800;">
          {job_title}
        </h3>
        <p style="margin: 0; font-size: 13px; color: #64748b;">
          🏢 {company_name} &nbsp;•&nbsp; 📍 {job_location}
        </p>
      </div>

      {interview_html}
      {note_html}

      <!-- Next Steps & Portal Link -->
      <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 24px 0 10px 0;">
        You can track the ongoing progress of all your applications, interview schedules, and recruiter updates anytime on your NDA Connect Candidate Portal:
      </p>

      <div style="text-align: center; margin: 24px 0;">
        <a href="http://localhost:5180/jobs/applications" style="display: inline-block; background-color: #c8102e; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; box-shadow: 0 4px 12px rgba(200, 16, 46, 0.25);">
          View Application in Portal
        </a>
      </div>

      <p style="font-size: 13px; color: #475569; margin: 28px 0 0 0; line-height: 1.5;">
        Warm regards,<br/>
        <strong>{recruiter_name}</strong><br/>
        <span style="color: #64748b; font-size: 12px;">Talent Acquisition Team • {company_name}</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 6px 0;">This is an automated notification sent regarding your application for {job_title} at NeST Digital.</p>
      <p style="margin: 0 0 4px 0;">NeST Tech Park, NeST Valley, Near Infopark, Infopark P.O, Kakkanad, Kochi, Kerala – 682042</p>
      <p style="margin: 0;">Phone: +91-484-4203333 • NeST Digital NDA Connect</p>
    </div>
  </div>
</body>
</html>
"""

    plain_body = f"""Dear {candidate_name},

{guidance_text.replace('<strong>', '').replace('</strong>', '')}

Application Status Update:
- Previous Status: {prev_status}
- New Status: {new_status}
- Role: {job_title}
- Company: {company_name}
- Location: {job_location}
{f"- Interview Date: {interview_date} {interview_time or ''} ({interview_location or 'Virtual'})" if (new_status == "Interview Scheduled" and interview_date) else ""}
{f"- Recruiter Note: {clean_note}" if clean_note else ""}

You can view your application status anytime on your NDA Connect portal:
http://localhost:5180/jobs/applications

Best regards,
{recruiter_name}
Talent Acquisition Team, {company_name}
NeST Tech Park, NeST Valley, Near Infopark, Infopark P.O, Kakkanad, Kochi, Kerala – 682042
Phone: +91-484-4203333
"""

    return plain_body, html_body


# ── Stats ──

@recruiter_bp.route("/stats", methods=["GET"])
@jwt_required()
@recruiter_required
def get_stats():
    """Aggregate stats for the recruiter dashboard."""
    db = get_db()
    user_id = get_jwt_identity()
    
    # Check if admin (admins see ALL activity, recruiters see only THEIR activity)
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    # Filter logic: All recruiters and admins share the same view
    job_filter = {}
    
    my_jobs = list(db["jobs"].find(job_filter))
    my_job_ids = []
    for j in my_jobs:
        my_job_ids.append(j["_id"])
        my_job_ids.append(str(j["_id"]))
    
    total_jobs = len(my_jobs)
    active_jobs = db["jobs"].count_documents({
        "$or": [{"is_active": True}, {"is_active": {"$exists": False}}]
    })
    total_applications = db["applications"].count_documents({"job_id": {"$in": my_job_ids}}) if my_job_ids else 0
    
    # Status breakdown (flexible matching for quotes or extra chars)
    shortlisted = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": {"$regex": "shortlisted", "$options": "i"}
    })
    hired = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": {"$regex": "(hired|offered)", "$options": "i"}
    })
    pending = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": {"$regex": "pending", "$options": "i"}
    })
    reviewed = db["applications"].count_documents({
        "job_id": {"$in": my_job_ids},
        "status": {"$in": ["Shortlisted", "Interview Scheduled", "Offered", "Rejected"]}
    })

    # Calculate weekly trends (Mon-Sun) and monthly trends (Jan-Dec)
    days_count = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0}
    months_count = {m: 0 for m in range(1, 13)}
    has_apps = False

    if my_job_ids:
        apps = db["applications"].find({"job_id": {"$in": my_job_ids}})
        for app in apps:
            applied_at = app.get("applied_at") or app.get("createdAt")
            if applied_at:
                if isinstance(applied_at, str):
                    try:
                        applied_at = datetime.fromisoformat(applied_at.replace("Z", "+00:00"))
                    except Exception:
                        continue
                try:
                    weekday = applied_at.isoweekday()
                    days_count[weekday] += 1
                    month_num = applied_at.month
                    if 1 <= month_num <= 12:
                        months_count[month_num] += 1
                    has_apps = True
                except Exception:
                    continue
                
    weekly_trends = [days_count[i] for i in range(1, 8)]
    monthly_trends = [months_count[i] for i in range(1, 13)]
    
    # Identify day with maximum candidate engagement
    weekdays_names = ["Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays", "Sundays"]
    if has_apps and any(days_count.values()):
        max_day_idx = max(days_count, key=days_count.get)
        best_day = weekdays_names[max_day_idx - 1]
        best_day_count = days_count[max_day_idx]
    else:
        best_day = None
        best_day_count = 0

    # Identify top performing role by candidate applications
    top_job = None
    if my_job_ids and total_applications > 0:
        pipeline = [
            {"$match": {"job_id": {"$in": my_job_ids}}},
            {"$group": {"_id": "$job_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        top_app = list(db["applications"].aggregate(pipeline))
        if top_app:
            target_id = top_app[0]["_id"]
            job_doc = None
            try:
                job_doc = db["jobs"].find_one({"_id": ObjectId(target_id)})
            except Exception:
                job_doc = db["jobs"].find_one({"_id": target_id})
            if job_doc:
                top_job = {"title": job_doc.get("title", "Role"), "count": top_app[0]["count"]}

    # Synchronized intelligent insights based strictly on live data
    insights = []
    if total_applications > 0:
        if pending > 0:
            insights.append({
                "type": "action",
                "title": "Pending Review",
                "message": f"{pending} candidate application{'s' if pending > 1 else ''} currently awaiting evaluation. Faster screening improves hiring conversion."
            })
        if shortlisted > 0:
            conv_rate = round((shortlisted / total_applications) * 100)
            insights.append({
                "type": "conversion",
                "title": "Shortlist Pipeline",
                "message": f"{shortlisted} of {total_applications} candidates ({conv_rate}%) are shortlisted. Move candidates forward to interview scheduling."
            })
        if top_job:
            insights.append({
                "type": "traction",
                "title": "Highest Traction Role",
                "message": f"'{top_job['title']}' leads engagement with {top_job['count']} candidate submission{'s' if top_job['count'] > 1 else ''}."
            })
        if best_day:
            insights.append({
                "type": "timing",
                "title": "Peak Submission Day",
                "message": f"Candidate applications peak on {best_day} ({best_day_count} received). Posting new roles early in the week maximizes engagement."
            })
    elif total_jobs > 0:
        insights.append({
            "type": "status",
            "title": "Active Postings Live",
            "message": f"{active_jobs} opening{'s' if active_jobs > 1 else ''} currently published and accepting applications. Candidate activity will populate here once submissions arrive."
        })
    else:
        insights.append({
            "type": "setup",
            "title": "No Active Openings",
            "message": "No active jobs currently in the pipeline. Post a job opening from Job Management to start receiving applicant submissions."
        })

    return jsonify({
        "success": True,
        "data": {
            "stats": {
                "total_jobs": total_jobs,
                "active_jobs": active_jobs,
                "total_applications": total_applications,
                "shortlisted": shortlisted,
                "hired": hired,
                "pending": pending,
                "reviewed": reviewed,
                "weekly_trends": weekly_trends,
                "monthly_trends": monthly_trends,
                "best_day": best_day,
                "insights": insights
            }
        }
    }), 200

# ── Job Management ──

@recruiter_bp.route("/jobs", methods=["GET"])
@jwt_required()
@recruiter_required
def get_my_jobs():
    """List jobs posted by the current recruiter."""
    db = get_db()
    user_id = get_jwt_identity()
    
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    job_filter = {}
    jobs_cursor = db["jobs"].find(job_filter).sort("createdAt", -1)
    
    jobs_list = []
    print(f"DEBUG: get_my_jobs found {db['jobs'].count_documents(job_filter)} jobs total")
    for j in jobs_cursor:
        j["id"] = str(j["_id"])
        del j["_id"]
        if "createdAt" in j and hasattr(j["createdAt"], "isoformat"):
            j["createdAt"] = j["createdAt"].isoformat()
        
        # Count applications for each job
        app_count = db["applications"].count_documents({"job_id": ObjectId(j["id"])})
        j["application_count"] = app_count
        
        jobs_list.append(j)
        
    return jsonify({
        "success": True,
        "data": {"jobs": jobs_list}
    }), 200

@recruiter_bp.route("/jobs", methods=["POST"])
@jwt_required()
@recruiter_required
def add_job():
    """Add a new job listing by recruiter."""
    data = request.get_json()
    db = get_db()
    
    if not data or not data.get("title"):
        return jsonify({"success": False, "message": "Job title is required."}), 400
    
    job_doc = {
        "title": data.get("title"),
        "company": data.get("company", "NeST Digital"),
        "location": data.get("location", ""),
        "salary": data.get("salary", ""),
        "type": data.get("type", "Full-time"),
        "description": data.get("description", ""),
        "requirements": data.get("requirements", []),
        "skills_required": data.get("skills_required", []),
        "experience_level": data.get("experience_level", "Entry Level"),
        "is_active": True,
        "posted_by": get_jwt_identity(),
        "createdAt": datetime.now(timezone.utc)
    }
    
    result = db["jobs"].insert_one(job_doc)

    # Notify all users about the new job
    try:
        job_title = job_doc["title"]
        company = job_doc["company"]
        current_recruiter_id = get_jwt_identity()
        
        # Broaden audience for verification: notify everyone except the poster
        users_cursor = db["users"].find({
            "_id": {"$ne": ObjectId(current_recruiter_id)}
        }, {"_id": 1, "full_name": 1})
        
        count = 0
        for u in users_cursor:
            create_notification(
                db,
                user_id=u["_id"],
                type_str="job",
                title="New Career Opportunity",
                message=f"'{job_title}' at {company} has just been posted. View details and apply now!",
                link="/jobs"
            )
            count += 1
            print(f"DEBUG: Sent job notification to user {u.get('full_name')} ({u['_id']})")
            
        print(f"SUCCESS: Dispatched {count} notifications for new job: {job_title}")
    except Exception as notify_err:
        print(f"CRITICAL ERROR in job notification dispatch: {notify_err}")

    return jsonify({
        "success": True, 
        "message": "Job posted successfully.",
        "data": {"id": str(result.inserted_id)}
    }), 201

@recruiter_bp.route("/jobs/<job_id>", methods=["GET", "PATCH"])
@jwt_required()
@recruiter_required
def manage_job(job_id):
    """Fetch or update a job listing."""
    db = get_db()
    
    try:
        oid = ObjectId(job_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid job ID."}), 400
        
    job = db["jobs"].find_one({"_id": oid})
    if not job:
        return jsonify({"success": False, "message": "Job not found."}), 404
        
    # Since the user has passed @recruiter_required, they have full access to manage any job
    # This allows the recruiting team to collaborate on listings.
    
    if request.method == "GET":
        job["id"] = str(job["_id"])
        del job["_id"]
        if "createdAt" in job and hasattr(job["createdAt"], "isoformat"):
            job["createdAt"] = job["createdAt"].isoformat()
        return jsonify({"success": True, "data": {"job": job}}), 200

    # PATCH logic
    data = request.get_json()
    update_fields = {}
    for field in ["title", "company", "location", "salary", "type", "description", "requirements", "skills_required", "experience_level", "is_active"]:
        if field in data:
            update_fields[field] = data[field]
            
    db["jobs"].update_one({"_id": oid}, {"$set": update_fields})
    return jsonify({"success": True, "message": "Job updated successfully."}), 200

@recruiter_bp.route("/jobs/<job_id>", methods=["DELETE"])
@jwt_required()
@recruiter_required
def delete_job(job_id):
    """Delete a job listing."""
    db = get_db()
    try:
        oid = ObjectId(job_id)
        job = db["jobs"].find_one({"$or": [{"_id": oid}, {"_id": str(job_id)}]})
    except Exception:
        job = db["jobs"].find_one({"_id": str(job_id)})

    if not job:
        return jsonify({"success": False, "message": "Job not found."}), 404
        
    target_id = job["_id"]
    db["jobs"].delete_one({"_id": target_id})
    db["applications"].delete_many({"$or": [{"job_id": target_id}, {"job_id": str(target_id)}]})
    
    return jsonify({"success": True, "message": "Job deleted successfully."}), 200

# ── Application Management ──

@recruiter_bp.route("/applications", methods=["GET"])
@jwt_required()
@recruiter_required
def get_job_applications():
    """List applications for jobs posted by this recruiter."""
    db = get_db()
    user_id = get_jwt_identity()
    
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    job_filter = {}
    
    # Find jobs 
    my_jobs = db["jobs"].find(job_filter)
    my_job_ids = [j["_id"] for j in my_jobs]
    
    apps_cursor = db["applications"].find({"job_id": {"$in": my_job_ids}}).sort("applied_at", -1)
    
    apps_list = []
    for a in apps_cursor:
        applied_at_val = a.get("applied_at")
        withdrawn_at_val = a.get("withdrawn_at")
        reapplied_at_val = a.get("reapplied_at")
        status_updated_at_val = a.get("status_updated_at") or a.get("updatedAt") or a.get("updated_at")

        # Determine viewed state
        is_viewed = bool(a.get("is_viewed")) or bool(a.get("viewed_by")) or (a.get("status") not in (None, "", "Applied", "pending") and bool(a.get("last_updated_by")))
        viewed_by = a.get("viewed_by") or (a.get("last_updated_by") if is_viewed else None)
        viewed_at_val = a.get("viewed_at") or (status_updated_at_val if is_viewed else None)

        app_data = {
            "id": str(a["_id"]),
            "status": a.get("status", "pending"),
            "cover_letter": a.get("cover_letter", ""),
            "applied_at": format_datetime_utc(applied_at_val),
            "withdrawn_at": format_datetime_utc(withdrawn_at_val),
            "reapplied_at": format_datetime_utc(reapplied_at_val),
            "status_updated_at": format_datetime_utc(status_updated_at_val),
            "updated_at": format_datetime_utc(status_updated_at_val),
            "interviewDate": format_datetime_utc(a.get("interviewDate")) if a.get("interviewDate") else None,
            "notes": a.get("notes", ""),
            "last_status_note": a.get("last_status_note", a.get("notes", "")),
            "last_updated_by": a.get("last_updated_by"),
            "is_viewed": is_viewed,
            "viewed_at": format_datetime_utc(viewed_at_val) if viewed_at_val else None,
            "viewed_by": viewed_by,
            "timeline": serialize_timeline(a.get("timeline"), a, is_internal=True),
            "email_history": serialize_email_history(a.get("email_history", [])),
            "resume_url": a.get("resume_url", "")
        }
        
        # Populate job info
        try:
            job = db["jobs"].find_one({"_id": ObjectId(a["job_id"])})
            if job:
                app_data["job_title"] = job.get("title", "")
        except Exception:
            pass
        
        # Populate user info
        try:
            user = db["users"].find_one({"_id": ObjectId(a["user_id"])})
            if user:
                app_data["applicant_name"] = a.get("full_name") or user.get("full_name", "")
                app_data["applicant_email"] = a.get("email") or user.get("email", "")
                app_data["applicant_id"] = str(user["_id"])
                app_data["applicant_picture"] = user.get("profile_picture")
                # Include full resume info for download
                raw_a_drive = a.get("resume_drive_link", "")
                raw_u_drive = user.get("resume_drive_link", "")
                safe_drive_link = raw_a_drive if _is_valid_drive_link(raw_a_drive) else (raw_u_drive if _is_valid_drive_link(raw_u_drive) else "")

                # Extract proper resume document name
                resume_file_name = a.get("resume_name") or user.get("resume_name", "")
                if not resume_file_name:
                    if raw_a_drive and not _is_valid_drive_link(raw_a_drive):
                        resume_file_name = raw_a_drive
                    elif raw_u_drive and not _is_valid_drive_link(raw_u_drive):
                        resume_file_name = raw_u_drive

                app_data["resume_url"] = a.get("resume_url") or user.get("resume_url", "")
                app_data["resume_name"] = resume_file_name
                app_data["resume_filename"] = resume_file_name
                app_data["resume_data"] = user.get("resume_data")
                app_data["applicant_status"] = user.get("status", "none")
                app_data["phone"] = a.get("phone") or user.get("phone", "")
                app_data["graduation_year"] = a.get("graduation_year") or user.get("graduation_year", "") or a.get("batch") or user.get("batch", "")
                app_data["batch"] = a.get("graduation_year") or user.get("graduation_year", "") or a.get("batch") or user.get("batch", "")
                app_data["current_organisation"] = a.get("current_organisation") or user.get("current_organisation", "") or a.get("current_company") or user.get("current_company", "")
                app_data["current_designation"] = a.get("current_designation") or user.get("current_designation", "") or a.get("title") or user.get("title", "")
                app_data["total_experience"] = a.get("total_experience") or user.get("total_experience", "")
                app_data["current_location"] = a.get("current_location") or user.get("current_location", "") or a.get("location") or user.get("location", "")
                app_data["location"] = a.get("current_location") or user.get("current_location", "") or a.get("location") or user.get("location", "")
                app_data["preferred_location"] = a.get("preferred_location") or user.get("preferred_location", "")
                app_data["resume_drive_link"] = safe_drive_link
                app_data["referral_source"] = a.get("referral_source") or user.get("referral_source", "")
                app_data["referral_source_details"] = a.get("referral_source_details") or user.get("referral_source_details", "")
                app_data["tech_stacks"] = a.get("tech_stacks") or user.get("tech_stacks", [])
                app_data["interested_positions"] = a.get("interested_positions") or user.get("interested_positions", [])
                app_data["declaration_confirmed"] = bool(a.get("declaration_confirmed") or user.get("declaration_confirmed", False))
                app_data["specialization"] = a.get("specialization") or user.get("specialization", "")
                app_data["linkedin_url"] = a.get("linkedin_url") or user.get("linkedin_url", "")
                app_data["github_url"] = user.get("github_url", "")
                app_data["portfolio_url"] = user.get("portfolio_url", "")
                app_data["skills"] = user.get("skills", [])
                app_data["bio"] = user.get("bio", "")
                app_data["experience"] = user.get("experience", [])
                app_data["education"] = user.get("education", [])
                app_data["certificates"] = user.get("certificates", [])
                app_data["emp_id"] = user.get("emp_id") or user.get("student_id", "")
                app_data["student_id"] = user.get("student_id", "")
                app_data["user_type"] = user.get("user_type", "")
                raw_college = (
                    a.get("college") or 
                    user.get("college") or 
                    a.get("referral_source_details") or 
                    user.get("referral_source_details") or 
                    ""
                )
                app_data["college"] = normalize_college_name(raw_college)
                is_admin_user = _is_user_added_by_admin(user)
                app_data["added_by_admin"] = is_admin_user
                app_data["not_added_by_admin"] = not is_admin_user
                app_data["form_data"] = {
                    "full_name": a.get("full_name", ""),
                    "email": a.get("email", ""),
                    "phone": a.get("phone", ""),
                    "college": a.get("college", "") or a.get("referral_source_details", ""),
                    "graduation_year": a.get("graduation_year", "") or a.get("batch", ""),
                    "batch": a.get("graduation_year", "") or a.get("batch", ""),
                    "specialization": a.get("specialization", ""),
                    "current_organisation": a.get("current_organisation", "") or a.get("current_company", ""),
                    "current_designation": a.get("current_designation", "") or a.get("title", ""),
                    "total_experience": a.get("total_experience", ""),
                    "current_location": a.get("current_location", "") or a.get("location", ""),
                    "preferred_location": a.get("preferred_location", ""),
                    "resume_drive_link": raw_a_drive if _is_valid_drive_link(raw_a_drive) else "",
                    "referral_source": a.get("referral_source", ""),
                    "referral_source_details": a.get("referral_source_details", ""),
                    "tech_stacks": a.get("tech_stacks", []),
                    "interested_positions": a.get("interested_positions", []),
                    "declaration_confirmed": bool(a.get("declaration_confirmed", False)),
                    "linkedin_url": a.get("linkedin_url", ""),
                    "resume_url": a.get("resume_url", ""),
                    "resume_name": a.get("resume_name", ""),
                    "cover_letter": a.get("cover_letter", ""),
                    "applied_at": format_datetime_utc(a.get("applied_at")),
                }
                app_data["profile_data"] = {
                    "full_name": user.get("full_name", ""),
                    "email": user.get("email", ""),
                    "phone": user.get("phone", ""),
                    "user_type": user.get("user_type", "") or user.get("role", "Alumni"),
                    "emp_id": user.get("emp_id") or user.get("student_id", ""),
                    "student_id": user.get("student_id", ""),
                    "college": user.get("college", "") or user.get("institution", ""),
                    "specialization": user.get("specialization", "") or user.get("department", ""),
                    "batch": user.get("batch", "") or user.get("graduation_year", ""),
                    "graduation_year": user.get("graduation_year", "") or user.get("batch", ""),
                    "bio": user.get("bio", ""),
                    "skills": user.get("skills", []),
                    "current_organisation": user.get("current_organisation") or user.get("current_company", ""),
                    "current_designation": user.get("current_designation") or user.get("title", ""),
                    "total_experience": user.get("total_experience", ""),
                    "current_location": user.get("current_location") or user.get("location", ""),
                    "preferred_location": user.get("preferred_location", ""),
                    "experience": user.get("experience", []),
                    "education": user.get("education", []),
                    "certificates": user.get("certificates", []),
                    "tech_stacks": user.get("tech_stacks", []),
                    "interested_positions": user.get("interested_positions", []),
                    "linkedin_url": user.get("linkedin_url", ""),
                    "github_url": user.get("github_url", ""),
                    "portfolio_url": user.get("portfolio_url", ""),
                    "resume_url": user.get("resume_url", ""),
                    "resume_name": user.get("resume_name", ""),
                    "resume_drive_link": raw_u_drive if _is_valid_drive_link(raw_u_drive) else "",
                    "declaration_confirmed": bool(user.get("declaration_confirmed", False))
                }
        except Exception:
            pass
        
        apps_list.append(app_data)
        
    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200

@recruiter_bp.route("/applications/recent", methods=["GET"])
@jwt_required()
@recruiter_required
def get_recent_applications():
    """Get the 5 most recent applications for the dashboard pipeline."""
    db = get_db()
    user_id = get_jwt_identity()
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    is_admin = user and user.get("role") in ("admin", "super_admin")
    
    job_filter = {}
    my_job_ids = [j["_id"] for j in db["jobs"].find(job_filter, {"_id": 1})]
    
    apps_cursor = db["applications"].find({"job_id": {"$in": my_job_ids}}).sort("applied_at", -1).limit(5)
    
    recent_apps = []
    for a in apps_cursor:
        job = db["jobs"].find_one({"_id": a["job_id"]}, {"title": 1})
        recent_apps.append({
            "id": str(a["_id"]),
            "role": job.get("title", "Unknown Position") if job else "Unknown Position",
            "candidates": 1, # Simplified for dashboard
            "stage": a.get("status", "Applied"),
            "status": "success" if a.get("status") in ["Offered", "Hired"] else "critical" if a.get("status") == "Rejected" else "high"
        })
    
    return jsonify({
        "success": True,
        "data": {"pipeline": recent_apps}
    }), 200

@recruiter_bp.route("/applications/<app_id>/status", methods=["PATCH"])
@jwt_required()
@recruiter_required
def update_application_status(app_id):
    """Update the status of an application and optionally trigger a personalized email."""
    data = request.get_json() or {}
    db = get_db()
    user_id = get_jwt_identity()
    
    valid_statuses = ["Applied", "Aptitude", "Shortlisted", "Interview Scheduled", "Offered", "Rejected", "Withdrawn"]
    new_status = data.get("status")
    notes = (data.get("notes") or "").strip()
    
    if new_status not in valid_statuses:
        return jsonify({"success": False, "message": f"Invalid status. Must be one of {valid_statuses}"}), 400
    
    if not notes:
        return jsonify({"success": False, "message": "Recruiter internal comment / reason is mandatory."}), 400
    
    # Verify the application exists
    app_doc = db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404
        
    job = db["jobs"].find_one({"_id": app_doc["job_id"]})
    user_doc = db["users"].find_one({"_id": ObjectId(user_id)})
    
    if not job or (job.get("posted_by") != user_id and user_doc.get("role") not in ["admin", "super_admin", "recruiter", "job_recruiter"]):
        return jsonify({"success": False, "message": "Access denied."}), 403
    
    now = datetime.now(timezone.utc)
    recruiter_name = (user_doc.get("full_name") if user_doc else "") or "Recruiter"
    recruiter_emp_id = (user_doc.get("emp_id") or user_doc.get("employee_id") or user_doc.get("student_id") or str(user_id)) if user_doc else str(user_id)
    recruiter_email = (user_doc.get("email") if user_doc else "") or ""
    recruiter_role = (user_doc.get("role") if user_doc else "Recruiter") or "Recruiter"
    prev_status = app_doc.get("status", "Applied")

    # Fetch candidate details
    applicant_user = db["users"].find_one({"_id": ObjectId(app_doc["user_id"])}) if app_doc.get("user_id") else None
    candidate_email = app_doc.get("email") or (applicant_user.get("email") if applicant_user else "")
    candidate_name = app_doc.get("full_name") or (applicant_user.get("full_name") if applicant_user else "Candidate")
    job_title = (job.get("title") if job else "") or app_doc.get("job_title") or "Position"
    job_location = (job.get("location") if job else "") or app_doc.get("job_location") or "Kochi, Kerala"
    company_name = (job.get("company") if job else "") or "NeST Digital"

    # Email Trigger Logic
    send_email_flag = data.get("send_email", True)
    custom_subject = data.get("email_subject")
    is_interview_stage = new_status == "Interview Scheduled"
    interview_date = (data.get("interviewDate") or data.get("interview_date")) if is_interview_stage else None
    interview_time = (data.get("interview_time") or "") if is_interview_stage else None
    interview_location = (data.get("interview_location") or "") if is_interview_stage else None
    candidate_note = (data.get("email_candidate_note") or data.get("emailCandidateNote") or data.get("candidate_note") or "").strip()

    email_sent = False
    email_log_entry = None

    if send_email_flag and candidate_email:
        subject = custom_subject or f"Application Status Update: {job_title} at {company_name} — {new_status}"
        plain_body, html_body = build_status_email_content(
            candidate_name=candidate_name,
            job_title=job_title,
            company_name=company_name,
            job_location=job_location,
            prev_status=prev_status,
            new_status=new_status,
            recruiter_name=recruiter_name,
            interview_date=interview_date,
            interview_time=interview_time,
            interview_location=interview_location,
            candidate_note=candidate_note
        )

        try:
            email_sent = send_email(candidate_email, subject, plain_body, html_body=html_body)
        except Exception as em_err:
            print(f"Status update email error: {em_err}")
            email_sent = False

        email_log_entry = {
            "id": str(uuid.uuid4())[:8],
            "sent_at": now,
            "sent_by": {
                "id": str(user_id),
                "name": recruiter_name,
                "email": recruiter_email,
                "recruiter_id": recruiter_emp_id,
                "role": "Recruiter" if "recruiter" in recruiter_role.lower() else recruiter_role.title()
            },
            "recipient_email": candidate_email,
            "recipient_name": candidate_name,
            "subject": subject,
            "status_from": prev_status,
            "status_to": new_status,
            "job_title": job_title,
            "job_location": job_location,
            "interview_date": interview_date,
            "interview_time": interview_time,
            "interview_location": interview_location,
            "candidate_note": candidate_note,
            "content": plain_body,
            "body": plain_body,
            "delivery_status": "Sent" if email_sent else "Failed"
        }

    status_event = {
        "action": "Status Changed",
        "status": new_status,
        "previous_status": prev_status,
        "timestamp": now,
        "actor_id": str(user_id),
        "actor_name": recruiter_name,
        "actor_role": "Recruiter" if "recruiter" in recruiter_role.lower() else recruiter_role.title(),
        "recruiter_id": recruiter_emp_id,
        "recruiter_email": recruiter_email,
        "note": notes or f"Application status updated to {new_status} by {recruiter_name}.",
        "email_sent": email_sent if send_email_flag else False
    }

    update_fields = {
        "status": new_status, 
        "status_updated_at": now,
        "updatedAt": now,
        "updated_at": now,
        "notes": notes,
        "last_status_note": notes,
        "is_viewed": True,
        "viewed_at": now,
        "viewed_by": {
            "id": str(user_id),
            "name": recruiter_name
        },
        "last_updated_by": {
            "id": str(user_id),
            "name": recruiter_name,
            "recruiter_id": recruiter_emp_id,
            "email": recruiter_email,
            "role": "Recruiter" if "recruiter" in recruiter_role.lower() else recruiter_role.title()
        }
    }
    if interview_date:
        update_fields["interviewDate"] = interview_date

    push_ops: dict = {"timeline": status_event}
    if email_log_entry:
        push_ops["email_history"] = email_log_entry

    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {
            "$set": update_fields,
            "$push": push_ops
        }
    )

    # Notify the applicant
    create_notification(
        db,
        user_id=app_doc["user_id"],
        type_str="info",
        title="Application Update",
        message=f"The status of your application for '{job.get('title')}' has been updated to '{new_status}'.",
        link="/jobs/applications"
    )

    serialized_email_entry = None
    if email_log_entry:
        serialized_email_entry = dict(email_log_entry)
        serialized_email_entry["sent_at"] = format_datetime_utc(email_log_entry["sent_at"])
    
    return jsonify({
        "success": True, 
        "message": f"Application status updated to {new_status}" + (" and email sent to applicant." if email_sent else (" (email dispatch unselected)." if not send_email_flag else " (email delivery failed).")),
        "email_sent": email_sent if send_email_flag else False,
        "email_log": serialized_email_entry
    }), 200


@recruiter_bp.route("/applications/<app_id>/send-email", methods=["POST"])
@jwt_required()
@recruiter_required
def send_application_email(app_id):
    """Trigger a custom or re-sent email directly to the applicant and log to email_history."""
    data = request.get_json() or {}
    db = get_db()
    user_id = get_jwt_identity()
    
    app_doc = db["applications"].find_one({"_id": ObjectId(app_id)})
    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404

    job = db["jobs"].find_one({"_id": app_doc["job_id"]}) or {}
    user_doc = db["users"].find_one({"_id": ObjectId(user_id)})
    
    applicant_user = db["users"].find_one({"_id": ObjectId(app_doc["user_id"])}) if app_doc.get("user_id") else None
    candidate_email = app_doc.get("email") or (applicant_user.get("email") if applicant_user else None)
    candidate_name = app_doc.get("full_name") or (applicant_user.get("full_name") if applicant_user else "Candidate")
    
    if not candidate_email:
        return jsonify({"success": False, "message": "Applicant does not have a valid email address on file."}), 400

    now = datetime.now(timezone.utc)
    recruiter_name = (user_doc.get("full_name") if user_doc else "") or "Recruiter"
    recruiter_emp_id = (user_doc.get("emp_id") or user_doc.get("employee_id") or str(user_id)) if user_doc else str(user_id)
    recruiter_email = (user_doc.get("email") if user_doc else "") or ""
    recruiter_role = (user_doc.get("role") if user_doc else "Recruiter") or "Recruiter"

    job_title = job.get("title") or app_doc.get("job_title") or "Position"
    job_location = job.get("location") or app_doc.get("job_location") or "Kochi, Kerala"
    company_name = job.get("company") or "NeST Digital"

    current_status = data.get("status") or app_doc.get("status", "Applied")
    prev_status = data.get("previous_status") or current_status
    subject = data.get("subject") or f"Application Status Update: {job_title} at {company_name} — {current_status}"
    is_interview_stage = current_status == "Interview Scheduled"
    interview_date = (data.get("interview_date") or app_doc.get("interviewDate")) if is_interview_stage else None
    interview_time = (data.get("interview_time") or "") if is_interview_stage else None
    interview_location = (data.get("interview_location") or "") if is_interview_stage else None

    custom_message = (data.get("message") or data.get("candidate_note") or "").strip()
    candidate_note = custom_message

    if custom_message and custom_message.lower().startswith("dear "):
        plain_body = f"""{custom_message}

You can track the ongoing progress of all your applications anytime on your NDA Connect Candidate Portal:
http://localhost:5180/jobs/applications

Warm regards,
{recruiter_name}
Talent Acquisition Team • {company_name}
NeST Tech Park, NeST Valley, Near Infopark, Infopark P.O, Kakkanad, Kochi, Kerala – 682042
Phone: +91-484-4203333
"""
        html_paragraphs = "".join([f"<p style='margin: 0 0 12px 0; line-height: 1.6;'>{p.replace(chr(10), '<br/>')}</p>" for p in custom_message.split("\n\n") if p.strip()])
        html_body = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Application Update</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: left; border-bottom: 3px solid #c8102e;">
      <h1 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0;">NeST <span style="color: #c8102e;">Digital</span> • NDA Connect</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase;">Talent Acquisition Team</p>
    </div>
    <div style="padding: 32px 30px; font-size: 14px; color: #334155;">
      {html_paragraphs}
      <div style="text-align: center; margin: 24px 0;">
        <a href="http://localhost:5180/jobs/applications" style="display: inline-block; background-color: #c8102e; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-weight: 700; text-decoration: none;">View Application in Portal</a>
      </div>
      <p style="font-size: 13px; color: #475569; margin: 28px 0 0 0;">
        Warm regards,<br/><strong>{recruiter_name}</strong><br/>
        <span style="color: #64748b; font-size: 12px;">Talent Acquisition Team • {company_name}</span>
      </p>
    </div>
    <div style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
      <p style="margin: 0 0 4px 0;">NeST Tech Park, NeST Valley, Near Infopark, Infopark P.O, Kakkanad, Kochi, Kerala – 682042</p>
      <p style="margin: 0;">Phone: +91-484-4203333 • NeST Digital NDA Connect</p>
    </div>
  </div>
</body>
</html>"""
    else:
        plain_body, html_body = build_status_email_content(
            candidate_name=candidate_name,
            job_title=job_title,
            company_name=company_name,
            job_location=job_location,
            prev_status=prev_status,
            new_status=current_status,
            recruiter_name=recruiter_name,
            interview_date=interview_date,
            interview_time=interview_time,
            interview_location=interview_location,
            candidate_note=candidate_note
        )

    email_sent = False
    try:
        email_sent = send_email(candidate_email, subject, plain_body, html_body=html_body)
    except Exception as em_err:
        print(f"Direct application email error: {em_err}")
        email_sent = False

    email_log_entry = {
        "id": str(uuid.uuid4())[:8],
        "sent_at": now,
        "sent_by": {
            "id": str(user_id),
            "name": recruiter_name,
            "email": recruiter_email,
            "recruiter_id": recruiter_emp_id,
            "role": "Recruiter" if "recruiter" in recruiter_role.lower() else recruiter_role.title()
        },
        "recipient_email": candidate_email,
        "recipient_name": candidate_name,
        "subject": subject,
        "status_from": prev_status,
        "status_to": current_status,
        "job_title": job_title,
        "job_location": job_location,
        "interview_date": interview_date,
        "interview_time": interview_time,
        "interview_location": interview_location,
        "candidate_note": candidate_note,
        "content": plain_body,
        "body": plain_body,
        "delivery_status": "Sent" if email_sent else "Failed"
    }

    db["applications"].update_one(
        {"_id": ObjectId(app_id)},
        {"$push": {"email_history": email_log_entry}}
    )

    serialized_entry = dict(email_log_entry)
    serialized_entry["sent_at"] = format_datetime_utc(email_log_entry["sent_at"])

    return jsonify({
        "success": True,
        "message": "Email sent successfully to candidate." if email_sent else "Email logged, but SMTP delivery could not be confirmed.",
        "email_sent": email_sent,
        "email_log": serialized_entry
    }), 200

@recruiter_bp.route("/applications/<app_id>/view", methods=["POST"])
@jwt_required()
@recruiter_required
def mark_application_viewed(app_id):
    """Mark an application as viewed by the current recruiter."""
    db = get_db()
    user_id = get_jwt_identity()
    user_doc = db["users"].find_one({"_id": ObjectId(user_id)})
    recruiter_name = (user_doc.get("full_name") if user_doc else "") or "Recruiter"
    now = datetime.now(timezone.utc)
    
    try:
        oid = ObjectId(app_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid application ID."}), 400
        
    app_doc = db["applications"].find_one({"_id": oid})
    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404
        
    db["applications"].update_one(
        {"_id": oid},
        {
            "$set": {
                "is_viewed": True,
                "viewed_at": now,
                "viewed_by": {
                    "id": str(user_id),
                    "name": recruiter_name
                }
            },
            "$push": {
                "view_history": {
                    "viewer_id": str(user_id),
                    "viewer_name": recruiter_name,
                    "viewed_at": now
                }
            }
        }
    )
    
    return jsonify({
        "success": True,
        "data": {
            "is_viewed": True,
            "viewed_at": format_datetime_utc(now),
            "viewed_by": {
                "id": str(user_id),
                "name": recruiter_name
            }
        }
    }), 200

# ── Talent Search & Mailing (🔥 RECRUITER ELITE) ──

@recruiter_bp.route("/talent-filters", methods=["GET"])
@jwt_required()
@recruiter_required
def get_talent_filters():
    db = get_db()
    
    # Aggregate unique specializations and skills
    specializations = db["users"].distinct("specialization")
    raw_skills = db["users"].distinct("skills")
    
    # Standardize skills (could be list or string)
    flat_skills = set()
    for s in raw_skills:
        if isinstance(s, list):
            for item in s: flat_skills.add(item)
        elif s:
            flat_skills.add(s)
            
    # Get course titles
    courses = db["courses"].distinct("title")
    
    return jsonify({
        "success": True,
        "data": {
            "specializations": sorted([s for s in specializations if s]),
            "skills": sorted(list(flat_skills)),
            "courses": sorted([c for c in courses if c])
        }
    }), 200

@recruiter_bp.route("/talents", methods=["GET"])
@jwt_required()
@recruiter_required
def search_talents():
    db = get_db()
    skill_query = request.args.get("skill")
    course_query = request.args.get("course")
    spec_query = request.args.get("specialization")
    job_id_query = request.args.get("job_id")
    
    query = {"role": {"$nin": ["admin", "super_admin", "recruiter", "job_recruiter"]}}
    
    if spec_query:
        query["specialization"] = spec_query
        
    if skill_query:
        query["$or"] = [
            {"skills": {"$regex": skill_query, "$options": "i"}},
            {"skills": {"$in": [skill_query]}}
        ]
        
    if course_query:
        # Find users who have completed or are enrolled in this course
        course = db["courses"].find_one({"title": course_query})
        if course:
            enrollments = db["course_enrollments"].find({"course_id": course["_id"]})
            user_ids = [e["user_id"] for e in enrollments]
            query["_id"] = {"$in": user_ids}

    if job_id_query:
        try:
            # Find all user_ids who applied for this job role
            apps = db["applications"].find({"job_id": ObjectId(job_id_query)})
            user_ids = [a["user_id"] for a in apps]
            # If multiple filters are active (e.g. course and job), intersect user_ids
            if "_id" in query and isinstance(query["_id"], dict) and "$in" in query["_id"]:
                existing_in = set(query["_id"]["$in"])
                query["_id"] = {"$in": list(existing_in.intersection(user_ids))}
            else:
                query["_id"] = {"$in": user_ids}
        except Exception:
            pass

    talents_cursor = db["users"].find(query).limit(100)
    talents_list = []
    for t in talents_cursor:
        talents_list.append({
            "id": str(t["_id"]),
            "full_name": t.get("full_name", ""),
            "email": t.get("email", ""),
            "specialization": t.get("specialization", "N/A"),
            "user_type": t.get("user_type", "Alumni"),
            "skills": ", ".join(t.get("skills", [])) if isinstance(t.get("skills"), list) else t.get("skills", "N/A")
        })
        
    return jsonify({
        "success": True,
        "data": {"talents": talents_list}
    }), 200

@recruiter_bp.route("/broadcast-mail", methods=["POST"])
@jwt_required()
@recruiter_required
def broadcast_mail():
    data = request.get_json()
    recipients = data.get("recipients", [])
    subject = data.get("subject", "")
    body = data.get("body", "")
    
    if not recipients or not subject or not body:
        return jsonify({"success": False, "message": "Missing required fields."}), 400
        
    db = get_db()
    
    # Send actual emails (real SMTP if configured, otherwise logs to console)
    email_count = broadcast_email(recipients, subject, body)
    
    # Also trigger in-app notifications
    sent_count = 0
    for email in recipients:
        user = db["users"].find_one({"email": email})
        if user:
            create_notification(
                db,
                user_id=user["_id"],
                type_str="system",
                title=f"💼 Career Invitation: {subject}",
                message=f"A recruiter has sent you a direct career opportunity. Message: {body[:100]}...",
                link="/jobs"
            )
            sent_count += 1

    # Record email in history
    try:
        sender_id = get_jwt_identity()
        mail_record = {
            "sender_id": sender_id,
            "subject": subject,
            "body": body,
            "recipients": recipients,
            "recipient_count": len(recipients),
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "email_count": email_count,
            "sent_count": sent_count,
            "status": "delivered"
        }
        db["recruiter_emails"].insert_one(mail_record)
    except Exception as e:
        print(f"Error logging recruiter broadcast email: {e}")
            
    return jsonify({
        "success": True,
        "message": f"Broadcast successfully sent to {email_count} emails and {sent_count} portal alerts."
    }), 200

@recruiter_bp.route("/mail-history", methods=["GET"])
@jwt_required()
@recruiter_required
def get_mail_history():
    db = get_db()
    emails_cursor = db["recruiter_emails"].find({}).sort("sent_at", -1).limit(100)
    history = []
    for item in emails_cursor:
        history.append({
            "id": str(item["_id"]),
            "subject": item.get("subject", ""),
            "body": item.get("body", ""),
            "recipients": item.get("recipients", []),
            "recipient_count": item.get("recipient_count", len(item.get("recipients", []))),
            "sent_at": item.get("sent_at", ""),
            "status": item.get("status", "delivered")
        })
    return jsonify({
        "success": True,
        "data": {"history": history}
    }), 200
