"""
Assessments Management Routes
Handles the 5-stage assessment engine for courses.
"""

from datetime import datetime, timezone, timedelta
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import get_db
from .notifications import create_notification

assessments_bp = Blueprint("assessments", __name__)

def get_assessment_status(db, user_id, course_id):
    """Helper to get or initialize an assessment attempt."""
    attempt = db["assessment_attempts"].find_one({
        "user_id": ObjectId(user_id),
        "course_id": ObjectId(course_id)
    })
    
    course = db["courses"].find_one({"_id": ObjectId(course_id)})
    # Course Manager only adds MCQ assessments (Stage 1)
    required = [1]
    if course and "required_assessments" in course and course["required_assessments"] and course["required_assessments"] != [1, 2, 3, 4, 5]:
        required = course["required_assessments"]

    if not attempt:
        # Check if user is enrolled
        enrolled = db["course_enrollments"].find_one({
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id)
        })
        if not enrolled:
            return None
            
        # Find first required stage
        first_stage = min(required) if required else 1

        # Initialize new attempt
        attempt = {
            "user_id": ObjectId(user_id),
            "course_id": ObjectId(course_id),
            "current_stage": first_stage,
            "is_completed": False,
            "stages": {
                str(i): {"status": "not_started" if i == first_stage else "locked", "data": {}}
                for i in [1, 2, 3, 4, 5]
            },
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        result = db["assessment_attempts"].insert_one(attempt)
        attempt["_id"] = result.inserted_id

    # If stage 1 is passed and only stage 1 is required, ensure is_completed is True and current_stage is 1
    if attempt.get("stages", {}).get("1", {}).get("status") == "passed" and required == [1]:
        if not attempt.get("is_completed") or attempt.get("current_stage") != 1:
            attempt["is_completed"] = True
            attempt["current_stage"] = 1
            db["assessment_attempts"].update_one(
                {"_id": attempt["_id"]},
                {"$set": {"is_completed": True, "current_stage": 1, "stages.2.status": "locked"}}
            )
            db["course_enrollments"].update_one(
                {"user_id": ObjectId(user_id), "course_id": ObjectId(course_id)},
                {"$set": {"status": "Completed", "progress": 100}}
            )
        
    attempt["required_assessments"] = required
    return attempt

@assessments_bp.route("/status/<course_id>", methods=["GET"])
@jwt_required()
def get_status(course_id):
    """Get assessment status for a specific course, including real assessment questions and latest submission."""
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        attempt = get_assessment_status(db, user_id, course_id)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400
        
    if not attempt:
        return jsonify({"success": False, "message": "Not enrolled in this course."}), 403
        
    attempt["id"] = str(attempt["_id"])
    del attempt["_id"]
    attempt["user_id"] = str(attempt["user_id"])
    attempt["course_id"] = str(attempt["course_id"])
    
    # Fetch real assessment questions from database
    assess_doc = None
    try:
        assess_doc = db["course_assessments"].find_one({
            "$or": [{"course_id": ObjectId(course_id)}, {"course_id": str(course_id)}]
        })
    except Exception:
        assess_doc = db["course_assessments"].find_one({"course_id": str(course_id)})

    assessment_info = None
    if assess_doc:
        safe_questions = []
        for q in assess_doc.get("questions", []):
            safe_questions.append({
                "id": q.get("id"),
                "text": q.get("text"),
                "options": q.get("options", []),
                "points": q.get("points", 1),
                "explanation": q.get("explanation", "")
            })
        assessment_info = {
            "id": str(assess_doc["_id"]),
            "title": assess_doc.get("title"),
            "description": assess_doc.get("description"),
            "passing_score": assess_doc.get("passing_score", 75),
            "time_limit_mins": assess_doc.get("time_limit_mins", 20),
            "questions_count": len(safe_questions),
            "questions": safe_questions
        }

    # Calculate attempts count & max_attempts limit
    u_query = [ObjectId(user_id), str(user_id)] if ObjectId.is_valid(str(user_id)) else [str(user_id)]
    c_query = [ObjectId(course_id), str(course_id)] if ObjectId.is_valid(str(course_id)) else [str(course_id)]
    attempts_count = db["assessment_submissions"].count_documents({
        "user_id": {"$in": u_query},
        "course_id": {"$in": c_query},
        "stage": 1
    })
    max_attempts = int(assess_doc.get("max_attempts", 3)) if assess_doc else 3
    attempts_left = max(0, max_attempts - attempts_count)

    if assessment_info:
        assessment_info["max_attempts"] = max_attempts
        assessment_info["attempts_count"] = attempts_count
        assessment_info["attempts_left"] = attempts_left
        assessment_info["can_retake"] = (attempts_left > 0)
        if latest_sub and latest_sub.get("passed"):
            st = latest_sub.get("submitted_at") or latest_sub.get("created_at")
            assessment_info["completed_at"] = st.isoformat() if hasattr(st, "isoformat") else str(st)

    # Fetch latest student submission from assessment_submissions
    latest_sub = None
    try:
        latest_sub = db["assessment_submissions"].find_one(
            {"user_id": {"$in": u_query}, "course_id": {"$in": c_query}},
            sort=[("submitted_at", -1)]
        )
    except Exception:
        pass

    sub_data = None
    if latest_sub:
        sub_time = latest_sub.get("submitted_at") or latest_sub.get("created_at")
        sub_data = {
            "id": str(latest_sub["_id"]),
            "stage": latest_sub.get("stage", 1),
            "score": latest_sub.get("score"),
            "correct_count": latest_sub.get("correct_count"),
            "total_questions": latest_sub.get("total_questions"),
            "passing_score": latest_sub.get("passing_score"),
            "passed": latest_sub.get("passed"),
            "status": latest_sub.get("status"),
            "feedback": latest_sub.get("feedback"),
            "reviewed_by": latest_sub.get("reviewed_by", ""),
            "assessment_title": latest_sub.get("assessment_title", ""),
            "answers": latest_sub.get("answers", []),
            "submitted_at": sub_time.isoformat() if hasattr(sub_time, "isoformat") else str(sub_time),
            "completed_at": (sub_time.isoformat() if hasattr(sub_time, "isoformat") else str(sub_time)) if latest_sub.get("passed") else None,
            "max_attempts": max_attempts,
            "attempts_count": attempts_count,
            "attempts_left": attempts_left,
            "can_retake": (attempts_left > 0)
        }

        # If answers array was empty in submission, construct it from attempt if available
        if (not sub_data.get("answers") or len(sub_data.get("answers")) == 0) and assess_doc:
            attempt_answers = attempt.get("stages", {}).get("1", {}).get("submission", {}).get("answers", [])
            ans_map = {str(a.get("question_id")): a.get("selected_option") for a in attempt_answers}
            graded_fallback = []
            for q in assess_doc.get("questions", []):
                qid = str(q.get("id"))
                sel = ans_map.get(qid)
                corr = q.get("correct_answer", 0)
                is_corr = (sel is not None and int(sel) == int(corr))
                graded_fallback.append({
                    "question_id": qid,
                    "question_text": q.get("text", ""),
                    "options": q.get("options", []),
                    "selected_option": int(sel) if sel is not None else None,
                    "correct_answer": int(corr),
                    "is_correct": is_corr,
                    "points": q.get("points", 1) if is_corr else 0,
                    "explanation": q.get("explanation", "")
                })
            sub_data["answers"] = graded_fallback

    return jsonify({
        "success": True,
        "data": {
            "attempt": attempt,
            "assessment": assessment_info,
            "latest_submission": sub_data
        }
    }), 200

@assessments_bp.route("/submit/<course_id>/<int:stage>", methods=["POST"])
@jwt_required()
def submit_stage(course_id, stage):
    """Submit real learner data for a specific assessment stage and sync directly with database."""
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    
    try:
        uid = ObjectId(user_id)
        cid = ObjectId(course_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid user or course identifier format."}), 400

    attempt = db["assessment_attempts"].find_one({
        "user_id": uid,
        "course_id": cid
    })
    
    if not attempt:
        return jsonify({"success": False, "message": "Assessment attempt not found."}), 404
        
    if stage > attempt.get("current_stage", 1):
        return jsonify({"success": False, "message": f"Please complete previous stages first. Current: {attempt.get('current_stage')}."}), 400
        
    stage_key = str(stage)
    now = datetime.now(timezone.utc)
    
    user = db["users"].find_one({"_id": uid})
    student_name = user.get("full_name") or user.get("name") or "Learner" if user else "Learner"
    student_email = user.get("email", "") if user else ""
    profile_pic = user.get("profile_picture") if user else None

    course = db["courses"].find_one({"_id": cid})
    course_name = course.get("title", "Course") if course else "Course"
    required = [1]
    if course and "required_assessments" in course and course["required_assessments"] and course["required_assessments"] != [1, 2, 3, 4, 5]:
        required = course["required_assessments"]

    if stage == 1:
        # Load assessment questions from database
        assess_doc = db["course_assessments"].find_one({
            "$or": [{"course_id": cid}, {"course_id": str(cid)}]
        })
        
        # Enforce maximum attempt limit set by Course Manager
        max_attempts = int(assess_doc.get("max_attempts", 3)) if assess_doc else 3
        u_query = [uid, str(uid)]
        c_query = [cid, str(cid)]
        attempts_count = db["assessment_submissions"].count_documents({
            "user_id": {"$in": u_query},
            "course_id": {"$in": c_query},
            "stage": 1
        })

        if attempts_count >= max_attempts:
            return jsonify({
                "success": False,
                "message": f"Maximum attempt limit reached ({max_attempts} of {max_attempts} attempts used). Please contact your Course Manager for an attempt reset."
            }), 403

        user_answers = data.get("answers") or []
        answer_map = {str(a.get("question_id")): a.get("selected_option") for a in user_answers}

        total_questions = 0
        correct_count = 0
        graded_answers = []
        passing_score = assess_doc.get("passing_score", 75) if assess_doc else 75
        
        if assess_doc and assess_doc.get("questions"):
            db_questions = assess_doc["questions"]
            total_questions = len(db_questions)
            for q in db_questions:
                qid = str(q.get("id"))
                selected_opt = answer_map.get(qid)
                corr_opt = q.get("correct_answer", 0)
                is_correct = (selected_opt is not None and int(selected_opt) == int(corr_opt))
                if is_correct:
                    correct_count += 1
                graded_answers.append({
                    "question_id": qid,
                    "question_text": q.get("text", ""),
                    "options": q.get("options", []),
                    "selected_option": int(selected_opt) if selected_opt is not None else None,
                    "correct_answer": int(corr_opt),
                    "is_correct": is_correct,
                    "points": q.get("points", 1) if is_correct else 0,
                    "explanation": q.get("explanation", "")
                })
            score = round((correct_count / total_questions) * 100) if total_questions > 0 else 100
        else:
            # Fallback if no questions configured yet
            score = int(data.get("score", 100))
            total_questions = int(data.get("total_questions", 1))
            correct_count = total_questions if score >= passing_score else 0

        passed = score >= passing_score
        status_label = "Approved" if passed else "Rejected"
        feedback_text = (
            f"Competency evaluation passed with {score}% ({correct_count}/{total_questions} correct answers)."
            if passed
            else f"Evaluation score was {score}% ({correct_count}/{total_questions} correct). Required passing threshold is {passing_score}%."
        )

        # Store in assessment_submissions so Course Manager evaluation and metrics sync immediately
        sub_doc = {
            "user_id": uid,
            "student_name": student_name,
            "student_email": student_email,
            "profile_picture": profile_pic,
            "course_id": cid,
            "course_name": course_name,
            "assessment_id": assess_doc["_id"] if assess_doc else f"stage_1_{course_id}",
            "assessment_title": assess_doc.get("title", f"{course_name} - Assessment") if assess_doc else f"{course_name} - Assessment",
            "stage": 1,
            "score": score,
            "correct_count": correct_count,
            "total_questions": total_questions,
            "passing_score": passing_score,
            "passed": passed,
            "status": status_label,
            "feedback": feedback_text,
            "answers": graded_answers,
            "attempt_number": attempts_count + 1,
            "max_attempts": max_attempts,
            "submitted_at": now,
            "created_at": now
        }
        db["assessment_submissions"].insert_one(sub_doc)

        new_status = "passed" if passed else "rejected"
        update_doc = {
            f"stages.{stage_key}.status": new_status,
            f"stages.{stage_key}.score": score,
            f"stages.{stage_key}.feedback": feedback_text,
            f"stages.{stage_key}.submission": data,
            f"stages.{stage_key}.submitted_at": now,
            "current_stage": 1,
            "updated_at": now
        }

        if passed:
            update_doc[f"stages.{stage_key}.completed_at"] = now
            update_doc["is_completed"] = True
            db["course_enrollments"].update_one(
                {"user_id": uid, "course_id": cid},
                {"$set": {"status": "Completed", "completed_at": now, "progress": 100}}
            )
        else:
            # Failed attempt - keep in progress and track progress
            update_doc["is_completed"] = False
            db["course_enrollments"].update_one(
                {"user_id": uid, "course_id": cid},
                {"$set": {"progress": max(0, min(90, score))}}
            )

        db["assessment_attempts"].update_one({"_id": attempt["_id"]}, {"$set": update_doc})

        msg = (
            f"Assessment passed with {score}%! Evaluation completed."
            if passed
            else f"Assessment score was {score}% (Passing score is {passing_score}%). Please review the questions and retry."
        )
        return jsonify({
            "success": True,
            "message": msg,
            "data": {
                "score": score,
                "passed": passed,
                "status": status_label,
                "correct_count": correct_count,
                "total_questions": total_questions,
                "passing_score": passing_score,
                "feedback": feedback_text,
                "answers": graded_answers,
                "submitted_at": now.isoformat()
            }
        }), 200

    else:
        # Stages 2-5: Practical/Project/Video submissions
        new_status = "pending"
        update_doc = {
            f"stages.{stage_key}.status": new_status,
            f"stages.{stage_key}.submission": data,
            f"stages.{stage_key}.submitted_at": now,
            "updated_at": now
        }

        # Store in assessment_submissions for Course Manager review
        sub_content_url = data.get("repo_url") or data.get("project_url") or data.get("video_url") or data.get("url") or ""
        sub_content_text = data.get("response") or data.get("code") or data.get("explanation") or f"Stage {stage} submission"
        
        sub_doc = {
            "user_id": uid,
            "student_name": student_name,
            "student_email": student_email,
            "profile_picture": profile_pic,
            "course_id": cid,
            "course_name": course_name,
            "assessment_id": f"stage_{stage}_{course_id}",
            "assessment_title": f"Stage {stage} Practical Assessment",
            "stage": stage,
            "score": 0,
            "correct_count": 0,
            "total_questions": 0,
            "passing_score": 75,
            "passed": False,
            "status": "Pending",
            "feedback": "Awaiting module manager evaluation.",
            "submission_data": data,
            "content": {
                "type": "github" if stage == 4 or stage == 2 else ("video" if stage == 5 else "text"),
                "url": sub_content_url,
                "text": sub_content_text
            },
            "answers": [],
            "submitted_at": now,
            "created_at": now
        }
        db["assessment_submissions"].insert_one(sub_doc)

        # Unlock next stage if sequential
        if stage == attempt.get("current_stage", 1):
            next_stages = [s for s in required if s > stage]
            if next_stages:
                next_stage = min(next_stages)
                update_doc["current_stage"] = next_stage
                update_doc[f"stages.{str(next_stage)}.status"] = "not_started"

        db["assessment_attempts"].update_one({"_id": attempt["_id"]}, {"$set": update_doc})

        # Notify course managers and admins
        cms = db["users"].find({"role": {"$in": ["course_manager", "admin", "super_admin"]}})
        for cm in cms:
            create_notification(
                db,
                cm["_id"],
                "course",
                f"New Stage {stage} Assessment Submitted",
                f"Learner {student_name} submitted Stage {stage} for '{course_name}'.",
                "/course-manager/assessments"
            )

        return jsonify({
            "success": True,
            "message": f"Stage {stage} submission received! Awaiting Course Manager review."
        }), 200

@assessments_bp.route("/enroll/<course_id>", methods=["POST"])
@jwt_required()
def enroll_course(course_id):
    """Enroll in a course."""
    db = get_db()
    user_id = get_jwt_identity()
    
    try:
        cid = ObjectId(course_id)
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid IDs."}), 400
        
    # Check if course exists
    course = db["courses"].find_one({"_id": cid})
    if not course:
        return jsonify({"success": False, "message": "Course not found."}), 404
        
    # Check if already enrolled
    existing = db["course_enrollments"].find_one({"user_id": uid, "course_id": cid})
    if existing:
        return jsonify({"success": False, "message": "Already enrolled."}), 400
        
    now = datetime.now(timezone.utc)
    db["course_enrollments"].insert_one({
        "user_id": uid,
        "course_id": cid,
        "enrolled_at": now,
        "progress": 0,
        "status": "In Progress"
    })

    # Update user profile in MongoDB so future applications reuse these details
    data = request.get_json(silent=True) or {}
    user_updates = {}
    candidate_keys = [
        "full_name", "phone", "graduation_year", "batch",
        "current_organisation", "current_company", "current_designation", "title",
        "total_experience", "current_location", "location", "preferred_location",
        "resume_drive_link", "resume_url", "resume_name", "referral_source", "referral_source_details", "tech_stacks", "interested_positions", "declaration_confirmed",
        "specialization"
    ]
    for key in candidate_keys:
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
    if "resume_drive_link" in user_updates and not user_updates.get("resume_url"):
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
        db["users"].update_one({"_id": uid}, {"$set": user_updates})
    
    # Initialize assessment attempt
    get_assessment_status(db, user_id, course_id)
    
    return jsonify({"success": True, "message": "Successfully enrolled in course."}), 201

@assessments_bp.route("/my-courses", methods=["GET"])
@jwt_required()
def get_my_courses():
    """Get list of courses the user is enrolled in, strictly enforcing assessment completion and passing score."""
    db = get_db()
    user_id = get_jwt_identity()
    
    enrollments = db["course_enrollments"].find({"user_id": ObjectId(user_id)})
    
    courses_list = []
    for en in enrollments:
        cid = en["course_id"]
        course = db["courses"].find_one({"_id": cid})
        if course:
            course["id"] = str(course["_id"])
            del course["_id"]

            # 1. Fetch Course Assessment configuration (created by Course Manager)
            assess_doc = db["course_assessments"].find_one({
                "$or": [{"course_id": cid}, {"course_id": str(cid)}]
            })
            passing_score = int(assess_doc.get("passing_score", 70)) if assess_doc else 70
            has_configured_questions = assess_doc is not None and bool(assess_doc.get("questions"))

            u_query = [ObjectId(user_id), str(user_id)] if ObjectId.is_valid(str(user_id)) else [str(user_id)]
            c_query = [cid, str(cid)] if not isinstance(cid, str) else ([ObjectId(cid), cid] if ObjectId.is_valid(cid) else [cid])

            # 2. Check latest assessment submission by this user for this course
            latest_sub = db["assessment_submissions"].find_one(
                {"user_id": {"$in": u_query}, "course_id": {"$in": c_query}},
                sort=[("submitted_at", -1)]
            )

            # 3. Check assessment attempt
            attempt = db["assessment_attempts"].find_one({
                "user_id": {"$in": u_query},
                "course_id": {"$in": c_query}
            })

            has_attended = False
            user_score = None
            has_passed = False

            if latest_sub:
                has_attended = True
                user_score = latest_sub.get("score")
                # Strictly compare user_score >= passing_score set by Course Manager
                has_passed = (user_score is not None and user_score >= passing_score)
            elif attempt and attempt.get("stages", {}).get("1", {}).get("submitted_at"):
                has_attended = True
                user_score = attempt.get("stages", {}).get("1", {}).get("score")
                has_passed = (user_score is not None and user_score >= passing_score)

            # CRITICAL RULE:
            # Course is ONLY "Completed" and certificate is ONLY available IF the assessment was attended AND passed!
            is_completed = has_passed
            enrollment_status = "Completed" if is_completed else "In Progress"

            completed_at = None
            if has_passed:
                sub_time = latest_sub.get("submitted_at") or latest_sub.get("created_at") if latest_sub else None
                if not sub_time and attempt and attempt.get("stages", {}).get("1", {}).get("submitted_at"):
                    sub_time = attempt.get("stages", {}).get("1", {}).get("submitted_at")
                if not sub_time and en.get("completed_at"):
                    sub_time = en.get("completed_at")
                if sub_time:
                    completed_at = sub_time.isoformat() if hasattr(sub_time, "isoformat") else str(sub_time)
                else:
                    completed_at = datetime.utcnow().isoformat()

            # Sync enrollment status in database
            update_fields = {"status": enrollment_status}
            if is_completed and completed_at and not en.get("completed_at"):
                update_fields["completed_at"] = completed_at
            if en.get("status") != enrollment_status or (is_completed and not en.get("completed_at")):
                db["course_enrollments"].update_one(
                    {"_id": en["_id"]},
                    {"$set": update_fields}
                )

            course["completed_at"] = completed_at
            course["enrollment_info"] = {
                "enrolled_at": en["enrolled_at"].isoformat() if hasattr(en["enrolled_at"], "isoformat") else en["enrolled_at"],
                "completed_at": completed_at,
                "progress": 100 if has_passed else en.get("progress", 0),
                "status": enrollment_status,
                "certificate_available": has_passed
            }

            # Calculate attempts count & max_attempts limit
            attempts_count = db["assessment_submissions"].count_documents({
                "user_id": {"$in": u_query},
                "course_id": {"$in": c_query},
                "stage": 1
            })
            max_attempts = int(assess_doc.get("max_attempts", 3)) if assess_doc else 3
            attempts_left = max(0, max_attempts - attempts_count)

            course["assessment_info"] = {
                "has_assessment": has_configured_questions,
                "has_attended": has_attended,
                "has_passed": has_passed,
                "score": user_score,
                "passing_score": passing_score,
                "completed_at": completed_at,
                "can_download_certificate": has_passed,
                "max_attempts": max_attempts,
                "attempts_count": attempts_count,
                "attempts_left": attempts_left,
                "can_retake": (attempts_left > 0),
                "status": "Passed" if has_passed else ("Failed" if has_attended else "Not Attended")
            }
            courses_list.append(course)
            
    return jsonify({
        "success": True,
        "data": {"courses": courses_list}
    }), 200
@assessments_bp.route("/update-progress", methods=["POST"])
@jwt_required()
def update_course_progress():
    """Update progress for a course enrollment."""
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    course_id = data.get("course_id")
    progress = data.get("progress", 0)
    
    if not course_id:
        return jsonify({"success": False, "message": "Course ID is required."}), 400
        
    try:
        cid = ObjectId(course_id)
        uid = ObjectId(user_id)
    except Exception:
        return jsonify({"success": False, "message": "Invalid IDs."}), 400
        
    # Check if assessment is passed before marking Completed
    assess_doc = db["course_assessments"].find_one({
        "$or": [{"course_id": cid}, {"course_id": str(cid)}]
    })
    passing_score = int(assess_doc.get("passing_score", 70)) if assess_doc else 70
    latest_sub = db["assessment_submissions"].find_one(
        {"user_id": uid, "course_id": cid},
        sort=[("submitted_at", -1)]
    )
    has_passed = bool(latest_sub and latest_sub.get("score") is not None and latest_sub.get("score") >= passing_score)
    status = "Completed" if has_passed else "In Progress"

    result = db["course_enrollments"].update_one(
        {"user_id": uid, "course_id": cid},
        {"$set": {"progress": progress, "status": status}}
    )
    
    if result.matched_count == 0:
        return jsonify({"success": False, "message": "Enrollment not found."}), 404
        
    return jsonify({"success": True, "message": "Progress updated successfully."}), 200

@assessments_bp.route("/performance-analytics", methods=["GET"])
@jwt_required()
def get_performance_analytics():
    """Retrieve real-time user performance level and course assessment evaluation history."""
    db = get_db()
    user_id = get_jwt_identity()

    try:
        uid = ObjectId(user_id)
        user = db["users"].find_one({"_id": uid})
    except Exception:
        user = db["users"].find_one({"email": str(user_id).strip().lower()})
        uid = user["_id"] if user else None

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # 1. Course Enrollments
    enrollments = list(db["course_enrollments"].find({"user_id": uid}))
    total_enrolled = len(enrollments)
    completed_courses = sum(1 for en in enrollments if en.get("status") == "Completed" or en.get("progress", 0) >= 100)
    course_completion_rate = round((completed_courses / max(1, total_enrolled)) * 100) if total_enrolled > 0 else 0

    # 2. Assessment Submissions (Real evaluations)
    submissions = list(db["assessment_submissions"].find({"user_id": uid}).sort("submitted_at", -1))

    # Keep latest submission per course
    courses_seen = set()
    latest_assessments = []
    total_scores = []
    passed_count = 0

    for sub in submissions:
        cid_str = str(sub.get("course_id", ""))
        if cid_str in courses_seen:
            continue
        courses_seen.add(cid_str)

        c_doc = db["courses"].find_one({"_id": sub.get("course_id")}) if sub.get("course_id") else None
        c_title = sub.get("course_name") or (c_doc.get("title") if c_doc else "Course Assessment")

        score_val = int(sub.get("score", 0))
        passed = bool(sub.get("passed", False) or sub.get("status") == "Approved")
        if passed:
            passed_count += 1
        total_scores.append(score_val)

        sub_time = sub.get("submitted_at") or sub.get("created_at")
        date_str = sub_time.strftime("%b %d, %Y") if hasattr(sub_time, "strftime") else (str(sub_time)[:10] if sub_time else "Recent")

        latest_assessments.append({
            "id": str(sub.get("_id")),
            "course_id": cid_str,
            "course_title": c_title,
            "assessment_title": sub.get("assessment_title") or f"{c_title} Assessment",
            "score": score_val,
            "passing_score": sub.get("passing_score", 75),
            "passed": passed,
            "status": sub.get("status", "Approved" if passed else "Rejected"),
            "feedback": sub.get("feedback", ""),
            "correct_count": sub.get("correct_count", 0),
            "total_questions": sub.get("total_questions", 0),
            "date": date_str
        })

    assessments_taken = len(latest_assessments)
    avg_score = round(sum(total_scores) / max(1, assessments_taken)) if assessments_taken > 0 else 0
    pass_rate = round((passed_count / max(1, assessments_taken)) * 100) if assessments_taken > 0 else 0

    # Performance Level calculation
    if assessments_taken > 0 and avg_score >= 85 and passed_count > 0:
        perf_level = "Advanced"
        perf_grade = "A"
        perf_title = "High Proficiency (Grade A)"
        perf_desc = "Demonstrated exemplary technical competency across course assessments."
        badge_color = "#16a34a"
    elif assessments_taken > 0 and avg_score >= 70 and passed_count > 0:
        perf_level = "Proficient"
        perf_grade = "B"
        perf_title = "Standard Competency (Grade B)"
        perf_desc = "Solid understanding and practical mastery of core technical curriculum."
        badge_color = "#2563eb"
    elif assessments_taken > 0 and avg_score >= 50 and passed_count > 0:
        perf_level = "Developing"
        perf_grade = "C"
        perf_title = "Basic Competency (Grade C)"
        perf_desc = "Satisfied passing benchmark with opportunities for skill refinement."
        badge_color = "#d97706"
    elif assessments_taken > 0:
        perf_level = "Needs Revision"
        perf_grade = "D"
        perf_title = "Revision Required (Grade D)"
        perf_desc = "Score is currently below passing threshold. Assessment retake recommended."
        badge_color = "#dc2626"
    else:
        perf_level = "Not Evaluated"
        perf_grade = "—"
        perf_title = "Getting Started"
        perf_desc = "No course assessments completed yet. Take assessments to establish your standing."
        badge_color = "#64748b"

    return jsonify({
        "success": True,
        "data": {
            "user": {
                "name": user.get("full_name") or user.get("name") or "Learner",
                "email": user.get("email", ""),
                "role": user.get("role", "trainee")
            },
            "performance": {
                "level": perf_level,
                "grade": perf_grade,
                "title": perf_title,
                "description": perf_desc,
                "badge_color": badge_color,
                "average_score": avg_score,
                "assessments_taken": assessments_taken,
                "assessments_passed": passed_count,
                "pass_rate": f"{pass_rate}%",
                "courses_enrolled": total_enrolled,
                "courses_completed": completed_courses,
                "completion_rate": f"{course_completion_rate}%"
            },
            "assessments": latest_assessments
        }
    }), 200

