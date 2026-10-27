"""
Job Applications Routes
Handles job application submission, status tracking, and management.
Users can apply for jobs and track their applications.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db
from utils.date_helpers import format_datetime_utc

applications_bp = Blueprint("applications", __name__)


def _is_valid_drive_link(link: str) -> bool:
    if not link or not isinstance(link, str):
        return False
    s = link.strip().lower()
    if s.startswith("data:") or s.endswith(".pdf") or s.endswith(".docx") or s.endswith(".doc"):
        return False
    return s.startswith("http://") or s.startswith("https://") or "drive.google.com" in s or "dropbox.com" in s or "onedrive." in s


def serialize_timeline(timeline_list, app_doc=None, is_internal: bool = False) -> list:
    """Format and guarantee chronological timeline events with ISO timestamps.
    If is_internal is False (applicant facing), recruiter comments and IDs are redacted.
    """
    events = []
    if isinstance(timeline_list, list) and timeline_list:
        for ev in timeline_list:
            if not isinstance(ev, dict):
                continue
            ts = ev.get("timestamp")
            iso_ts = format_datetime_utc(ts)
            
            ev_data = {
                "action": ev.get("action", "Event"),
                "status": ev.get("status", ""),
                "previous_status": ev.get("previous_status"),
                "timestamp": iso_ts,
            }
            
            if is_internal:
                ev_data["actor_name"] = ev.get("actor_name", "System")
                ev_data["actor_role"] = ev.get("actor_role", "System")
                ev_data["actor_id"] = str(ev.get("actor_id")) if ev.get("actor_id") else None
                ev_data["recruiter_id"] = ev.get("recruiter_id")
                ev_data["recruiter_email"] = ev.get("recruiter_email")
                ev_data["note"] = ev.get("note", "")
            else:
                # Applicant view: only show clean status and timestamp, never internal recruiter notes or recruiter IDs
                ev_data["actor_name"] = "NeST Recruitment"
                ev_data["actor_role"] = "System"
                ev_data["note"] = None
                
            events.append(ev_data)

    # Ensure all timestamps on the document are represented in events
    if app_doc:
        name = app_doc.get("full_name") or "Applicant"
        applied_at = app_doc.get("applied_at")
        withdrawn_at = app_doc.get("withdrawn_at")
        reapplied_at = app_doc.get("reapplied_at")
        status_updated_at = app_doc.get("status_updated_at") or app_doc.get("updatedAt") or app_doc.get("updated_at")
        current_status = app_doc.get("status")

        has_applied = any(e.get("action") == "Applied" for e in events)
        if not has_applied and applied_at:
            events.append({
                "action": "Applied",
                "status": "Applied",
                "previous_status": None,
                "timestamp": format_datetime_utc(applied_at),
                "actor_name": name if is_internal else "Applicant",
                "actor_role": "Candidate",
                "note": "Initial application submitted." if is_internal else None
            })

        has_withdrawn = any(e.get("action") == "Withdrawn" or e.get("status") == "Withdrawn" for e in events)
        if not has_withdrawn and withdrawn_at:
            events.append({
                "action": "Withdrawn",
                "status": "Withdrawn",
                "previous_status": "Applied",
                "timestamp": format_datetime_utc(withdrawn_at),
                "actor_name": name if is_internal else "Applicant",
                "actor_role": "Candidate",
                "note": "Application withdrawn by candidate." if is_internal else None
            })

        has_reapplied = any(e.get("action") == "Reapplied" for e in events)
        if not has_reapplied and reapplied_at:
            events.append({
                "action": "Reapplied",
                "status": "Applied",
                "previous_status": "Withdrawn",
                "timestamp": format_datetime_utc(reapplied_at),
                "actor_name": name if is_internal else "Applicant",
                "actor_role": "Candidate",
                "note": "Candidate reapplied for this position." if is_internal else None
            })

        has_status = any(e.get("status") == current_status for e in events)
        if not has_status and current_status and current_status not in ["Applied", "pending", "Withdrawn"] and status_updated_at:
            events.append({
                "action": "Status Changed",
                "status": current_status,
                "previous_status": "Applied",
                "timestamp": format_datetime_utc(status_updated_at),
                "actor_name": "NeST Recruitment Team" if is_internal else "NeST Recruitment",
                "actor_role": "Recruiter" if is_internal else "System",
                "note": f"Application status updated to {current_status}." if is_internal else None
            })

    # Sort events chronologically by timestamp
    events.sort(key=lambda x: str(x.get("timestamp") or ""))
    return events


def _serialize_application(app_doc: dict, db=None, is_internal: bool = False) -> dict:
    """Convert a MongoDB application document to a JSON-safe dictionary.
    When is_internal is False, recruiter internal notes and identities are excluded.
    """
    raw_drive_link = app_doc.get("resume_drive_link", "")
    safe_drive_link = raw_drive_link if _is_valid_drive_link(raw_drive_link) else ""
    raw_resume_url = app_doc.get("resume_url", "") or safe_drive_link
    resume_file_name = app_doc.get("resume_name", "")
    if not resume_file_name and raw_drive_link and not _is_valid_drive_link(raw_drive_link):
        resume_file_name = raw_drive_link

    applied_at_val = app_doc.get("applied_at")
    withdrawn_at_val = app_doc.get("withdrawn_at")
    reapplied_at_val = app_doc.get("reapplied_at")
    status_updated_at_val = app_doc.get("status_updated_at") or app_doc.get("updatedAt") or app_doc.get("updated_at")

    result = {
        "id": str(app_doc["_id"]),
        "job_id": str(app_doc.get("job_id", "")),
        "user_id": str(app_doc.get("user_id", "")),
        "cover_letter": app_doc.get("cover_letter", ""),
        "resume_url": raw_resume_url,
        "resume_name": resume_file_name,
        "resume_filename": resume_file_name,
        "resume_drive_link": safe_drive_link,
        "status": "Applied" if app_doc.get("status") in ["pending", None] else app_doc.get("status"),
        "applied_at": format_datetime_utc(applied_at_val),
        "withdrawn_at": format_datetime_utc(withdrawn_at_val),
        "reapplied_at": format_datetime_utc(reapplied_at_val),
        "status_updated_at": format_datetime_utc(status_updated_at_val),
        "updated_at": format_datetime_utc(status_updated_at_val),
        "interviewDate": format_datetime_utc(app_doc.get("interviewDate")) if app_doc.get("interviewDate") else None,
        # Recruiter internal notes are strictly hidden from applicant view
        "notes": app_doc.get("notes", "") if is_internal else "",
        "timeline": serialize_timeline(app_doc.get("timeline"), app_doc, is_internal=is_internal),
    }

    if is_internal:
        result["last_status_note"] = app_doc.get("last_status_note", app_doc.get("notes", ""))
        result["last_updated_by"] = app_doc.get("last_updated_by")

    # Optionally populate job details
    if db is not None and app_doc.get("job_id"):
        try:
            job = db["jobs"].find_one({"_id": ObjectId(app_doc["job_id"])})
            if job:
                result["job_title"] = job.get("title", "")
                result["job_company"] = job.get("company", "")
                result["job_location"] = job.get("location", "")
                is_active_val = job.get("is_active", True)
                if is_active_val is False or str(is_active_val).lower() in ["false", "0", "inactive", "no"]:
                    job_active = False
                elif str(job.get("status", "")).lower() in ["closed", "inactive", "archived", "expired"]:
                    job_active = False
                else:
                    job_active = True
                result["job_is_active"] = job_active
                result["job_status"] = "Active" if job_active else "Closed"
            else:
                result["job_is_active"] = False
                result["job_status"] = "Closed"
        except Exception as e:
            result["job_is_active"] = False
            result["job_status"] = "Closed"

    # Optionally populate user details
    if db is not None and app_doc.get("user_id"):
        try:
            user = db["users"].find_one({"_id": ObjectId(app_doc["user_id"])})
            if user:
                result["applicant_name"] = user.get("full_name", "")
                result["applicant_email"] = user.get("email", "")
        except Exception as e:
            print(f"Error parsing resume_data: {e}")

    return result


import traceback

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


def _clean_list(val) -> list:
    """Safely convert list or stringified list into a clean list of strings."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(x).strip() for x in val if str(x).strip()]
    if isinstance(val, str):
        s = val.strip()
        if (s.startswith("[") and s.endswith("]")) or (s.startswith("(") and s.endswith(")")):
            import ast
            try:
                parsed = ast.literal_eval(s)
                if isinstance(parsed, (list, tuple)):
                    return [str(x).strip() for x in parsed if str(x).strip()]
            except Exception:
                pass
            inner = s[1:-1].strip()
            return [x.strip().strip("'\"") for x in inner.split(",") if x.strip().strip("'\"")]
        return [x.strip() for x in s.split(",") if x.strip()]
    return []


# ── Apply for a Job ──

@applications_bp.route("", methods=["POST"])
@jwt_required()
def apply_for_job():
    """Submit a job application."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json(silent=True)

        if not data or not data.get("job_id"):
            return jsonify({"success": False, "message": "Job ID is required."}), 400

        db = get_db()

        # Verify job exists
        try:
            job = db["jobs"].find_one({"_id": ObjectId(data["job_id"])})
        except Exception as e:
            print(f"Invalid job ID format: {e}")
            return jsonify({"success": False, "message": "Invalid job ID format."}), 400

        if not job:
            return jsonify({"success": False, "message": "Job not found."}), 404

        # Validate that the job posting is active and accepting applications
        is_active_val = job.get("is_active", True)
        is_closed_status = str(job.get("status", "")).lower() in ["closed", "inactive", "archived", "expired"]
        if is_active_val is False or str(is_active_val).lower() in ["false", "0", "inactive", "no"] or is_closed_status:
            return jsonify({
                "success": False,
                "message": "This position is currently closed and is no longer accepting new applications or re-applications."
            }), 400

        # Check if user already has an active (non-withdrawn) application
        existing = db["applications"].find_one({
            "user_id": ObjectId(user_id),
            "job_id": ObjectId(data["job_id"]),
            "status": {"$nin": ["Withdrawn", "withdrawn"]}
        })
        if existing:
            return jsonify({"success": False, "message": "You have already applied for this job."}), 409

        # Check for previously withdrawn application to enable re-applying while preserving complete audit history
        existing_withdrawn = db["applications"].find_one({
            "user_id": ObjectId(user_id),
            "job_id": ObjectId(data["job_id"]),
            "status": {"$in": ["Withdrawn", "withdrawn"]}
        })

        applicant_user = db["users"].find_one({"_id": ObjectId(user_id)})
        applicant_name = (
            data.get("full_name")
            or (applicant_user.get("full_name") if applicant_user else "")
            or "Applicant"
        )

        # Clean list fields
        tech_stacks = _clean_list(data.get("tech_stacks"))
        interested_positions = _clean_list(data.get("interested_positions"))
        job_title = job.get("title", "")
        if job_title and not any(p.lower() == job_title.lower() for p in interested_positions):
            interested_positions.append(job_title)

        raw_college = data.get("college") or data.get("referral_source_details") or ""
        normalized_col = normalize_college_name(raw_college) if raw_college else ""

        raw_drive = data.get("resume_drive_link", "")
        safe_drive = raw_drive if _is_valid_drive_link(raw_drive) else ""
        raw_resume = data.get("resume_url", "") or safe_drive

        now = datetime.now(timezone.utc)

        application_doc = {
            "user_id": ObjectId(user_id),
            "job_id": ObjectId(data["job_id"]),
            "cover_letter": data.get("cover_letter", ""),
            "resume_url": raw_resume,
            "resume_name": data.get("resume_name", ""),
            "resume_drive_link": safe_drive,
            "full_name": data.get("full_name", "") or applicant_name,
            "email": data.get("email", "") or (applicant_user.get("email") if applicant_user else ""),
            "phone": data.get("phone", ""),
            "graduation_year": data.get("graduation_year", "") or data.get("batch", ""),
            "batch": data.get("graduation_year", "") or data.get("batch", ""),
            "current_organisation": data.get("current_organisation", "") or data.get("current_company", ""),
            "current_company": data.get("current_organisation", "") or data.get("current_company", ""),
            "current_designation": data.get("current_designation", "") or data.get("title", ""),
            "total_experience": data.get("total_experience", ""),
            "current_location": data.get("current_location", "") or data.get("location", ""),
            "location": data.get("current_location", "") or data.get("location", ""),
            "preferred_location": data.get("preferred_location", ""),
            "referral_source": data.get("referral_source", ""),
            "referral_source_details": data.get("referral_source_details", ""),
            "college": normalized_col,
            "tech_stacks": tech_stacks,
            "interested_positions": interested_positions,
            "declaration_confirmed": bool(data.get("declaration_confirmed", False)),
            "specialization": data.get("specialization", ""),
            "linkedin_url": data.get("linkedin_url", "") or data.get("linkedin", ""),
            "status": "Applied",  # Applied | Aptitude | Shortlisted | Interview Scheduled | Offered | Rejected
            "status_updated_at": now,
            "updated_at": now,
        }

        if existing_withdrawn:
            # Candidate is REAPPLYING for a withdrawn job application!
            orig_applied_at = existing_withdrawn.get("applied_at") or now
            prior_timeline = serialize_timeline(existing_withdrawn.get("timeline"), existing_withdrawn)

            reapply_event = {
                "action": "Reapplied",
                "status": "Applied",
                "previous_status": "Withdrawn",
                "timestamp": now,
                "actor_name": applicant_name,
                "actor_role": "Candidate",
                "note": "Candidate reapplied for this position."
            }

            application_doc["applied_at"] = orig_applied_at
            application_doc["reapplied_at"] = now
            application_doc["withdrawn_at"] = existing_withdrawn.get("withdrawn_at")
            application_doc["timeline"] = prior_timeline + [reapply_event]

            db["applications"].update_one(
                {"_id": existing_withdrawn["_id"]},
                {"$set": application_doc}
            )
            app_id = str(existing_withdrawn["_id"])
        else:
            # Brand new initial application
            initial_event = {
                "action": "Applied",
                "status": "Applied",
                "previous_status": None,
                "timestamp": now,
                "actor_name": applicant_name,
                "actor_role": "Candidate",
                "note": "Initial application submitted."
            }
            application_doc["applied_at"] = now
            application_doc["reapplied_at"] = None
            application_doc["withdrawn_at"] = None
            application_doc["timeline"] = [initial_event]

            result = db["applications"].insert_one(application_doc)
            app_id = str(result.inserted_id)

        # Update user profile in MongoDB so future applications, courses, and events automatically reuse these details
        user_updates = {
            "tech_stacks": tech_stacks,
            "interested_positions": interested_positions,
            "declaration_confirmed": bool(data.get("declaration_confirmed", False)),
        }
        if normalized_col:
            user_updates["college"] = normalized_col

        candidate_str_keys = [
            "full_name", "phone", "graduation_year", "batch",
            "current_organisation", "current_company", "current_designation", "title",
            "total_experience", "current_location", "location", "preferred_location",
            "resume_drive_link", "resume_url", "resume_name", "referral_source", "referral_source_details",
            "specialization"
        ]
        for key in candidate_str_keys:
            val = data.get(key)
            if val is not None and str(val).strip():
                user_updates[key] = str(val).strip()

        # Sync aliases
        if "graduation_year" in user_updates and not user_updates.get("batch"):
            user_updates["batch"] = user_updates["graduation_year"]
        if "batch" in user_updates and not user_updates.get("graduation_year"):
            user_updates["graduation_year"] = user_updates["batch"]
        if "current_organisation" in user_updates and not user_updates.get("current_company"):
            user_updates["current_company"] = user_updates["current_organisation"]
        if "current_company" in user_updates and not user_updates.get("current_organisation"):
            user_updates["current_organisation"] = user_updates["current_company"]
        if "current_designation" in user_updates and not user_updates.get("title"):
            user_updates["title"] = user_updates["current_designation"]
        if "current_location" in user_updates and not user_updates.get("location"):
            user_updates["location"] = user_updates["current_location"]
        if "resume_drive_link" in user_updates:
            if not _is_valid_drive_link(user_updates["resume_drive_link"]):
                user_updates["resume_drive_link"] = ""
            elif not user_updates.get("resume_url"):
                user_updates["resume_url"] = user_updates["resume_drive_link"]

        linkedin_val = data.get("linkedin_url") or data.get("linkedin")
        if linkedin_val:
            user_updates["linkedin_url"] = str(linkedin_val).strip()
        if data.get("full_name"):
            user_updates["full_name"] = str(data["full_name"]).strip()
        elif data.get("firstName") or data.get("lastName"):
            composed_name = f"{data.get('firstName', '')} {data.get('lastName', '')}".strip()
            if composed_name:
                user_updates["full_name"] = composed_name

        if user_updates:
            user_updates["updated_at"] = datetime.now(timezone.utc)
            db["users"].update_one({"_id": ObjectId(user_id)}, {"$set": user_updates})

            # Also synchronize candidate details across existing applications
            shared_app_updates = {}
            for k in ["full_name", "phone", "college", "location", "current_location", "resume_url", "resume_drive_link", "graduation_year", "batch", "total_experience", "current_organisation", "current_designation", "specialization", "linkedin_url"]:
                if k in user_updates:
                    shared_app_updates[k] = user_updates[k]
            if shared_app_updates:
                db["applications"].update_many({"user_id": ObjectId(user_id)}, {"$set": shared_app_updates})

        # Notify the recruiter who posted the job
        try:
            from .notifications import create_notification
            applicant = db["users"].find_one({"_id": ObjectId(user_id)})
            applicant_name = applicant.get("full_name", "Someone") if applicant else "Someone"
            job_title = job.get("title", "a job")
            recruiter_id = job.get("posted_by") or job.get("recruiter_id")
            if recruiter_id:
                create_notification(
                    db,
                    user_id=recruiter_id,
                    type_str="job",
                    title="New Application Received",
                    message=f"{applicant_name} applied for '{job_title}'.",
                    link=f"/recruiter/applications"
                )
        except Exception as notify_err:
            print(f"Notification error (non-critical): {notify_err}")

        return jsonify({
            "success": True,
            "message": "Application submitted successfully!",
            "data": {"id": app_id}
        }), 201
    except Exception as e:
        print(f"ERROR in apply_for_job: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "message": f"Server error: {str(e)}"}), 500


# ── Get My Applications ──

@applications_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_applications():
    """Get all applications submitted by the current user."""
    user_id = get_jwt_identity()
    db = get_db()

    apps_cursor = db["applications"].find(
        {"user_id": ObjectId(user_id)}
    ).sort("applied_at", -1)

    apps_list = [_serialize_application(a, db) for a in apps_cursor]

    return jsonify({
        "success": True,
        "data": {"applications": apps_list}
    }), 200


# ── Get Single Application ──

@applications_bp.route("/<application_id>", methods=["GET"])
@jwt_required()
def get_application(application_id):
    """Get details of a specific application."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        app_doc = db["applications"].find_one({"_id": ObjectId(application_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid application ID."}), 400

    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404

    user = db["users"].find_one({"_id": ObjectId(user_id)})
    user_role = (user.get("role") if user else "") or ""
    is_staff = user_role in ["admin", "super_admin", "recruiter", "job_recruiter"]

    # Users can only see their own applications unless they are staff
    if str(app_doc["user_id"]) != user_id and not is_staff:
        return jsonify({"success": False, "message": "Access denied."}), 403

    return jsonify({
        "success": True,
        "data": {"application": _serialize_application(app_doc, db, is_internal=is_staff)}
    }), 200


# ── Withdraw Application ──

@applications_bp.route("/<application_id>", methods=["DELETE"])
@jwt_required()
def withdraw_application(application_id):
    """Withdraw a job application (only if still pending)."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        app_doc = db["applications"].find_one({"_id": ObjectId(application_id)})
    except Exception:
        return jsonify({"success": False, "message": "Invalid application ID."}), 400

    if not app_doc:
        return jsonify({"success": False, "message": "Application not found."}), 404

    if str(app_doc["user_id"]) != user_id:
        return jsonify({"success": False, "message": "Access denied."}), 403

    if str(app_doc.get("status", "")).strip().lower() not in ("applied", "pending"):
        return jsonify({"success": False, "message": "Can only withdraw initial applications (Applied/Pending)."}), 400

    now = datetime.now(timezone.utc)
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    applicant_name = (user.get("full_name") if user else "") or app_doc.get("full_name") or "Applicant"
    prev_status = app_doc.get("status", "Applied")

    withdraw_event = {
        "action": "Withdrawn",
        "status": "Withdrawn",
        "previous_status": prev_status,
        "timestamp": now,
        "actor_name": applicant_name,
        "actor_role": "Candidate",
        "note": "Application withdrawn by candidate."
    }

    db["applications"].update_one(
        {"_id": ObjectId(application_id)},
        {
            "$set": {
                "status": "Withdrawn",
                "withdrawn_at": now,
                "status_updated_at": now,
                "updated_at": now
            },
            "$push": {"timeline": withdraw_event}
        }
    )

    return jsonify({
        "success": True,
        "message": "Application withdrawn successfully."
    }), 200
