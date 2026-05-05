"""
Social Feed & Posts Routes
Handles social posts, comments, likes — the community feed.
"""

from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import get_db
from .notifications import create_notification

social_bp = Blueprint("social", __name__)


def _serialize_post(post: dict, db=None, current_user_id=None) -> dict:
    """Convert a MongoDB post document to a JSON-safe dictionary."""
    result = {
        "id": str(post["_id"]),
        "author_id": str(post.get("author_id", "")),
        "content": post.get("content", ""),
        "image_url": post.get("image_url"),
        "video_url": post.get("video_url"),
        "likes_count": len(post.get("likes", [])),
        "comments_count": len(post.get("comments", [])),
        "is_liked": False,
        "created_at": post.get("created_at").isoformat() if post.get("created_at") else None,
    }

    # Check if current user liked this post
    if current_user_id and post.get("likes"):
        result["is_liked"] = ObjectId(current_user_id) in post["likes"]

    # Populate author details
    if db is not None and post.get("author_id"):
        try:
            author = db["users"].find_one({"_id": ObjectId(post["author_id"])})
            if author:
                result["author_name"] = author.get("full_name", "")
                result["author_type"] = author.get("user_type", "")
                result["author_picture"] = author.get("profile_picture")
        except:
            pass

    # Include comments (latest 5)
    if post.get("comments"):
        result["comments"] = []
        for c in post["comments"][-5:]:
            comment = {
                "id": str(c.get("_id", "")),
                "text": c.get("text", ""),
                "author_name": c.get("author_name", ""),
                "created_at": c.get("created_at").isoformat() if c.get("created_at") else None,
            }
            result["comments"].append(comment)

    return result


# ── Get Feed ──

@social_bp.route("/feed", methods=["GET"])
@jwt_required()
def get_feed():
    """Get the social feed (all posts, newest first)."""
    user_id = get_jwt_identity()
    db = get_db()

    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    skip = (page - 1) * per_page

    posts_cursor = db["posts"].find().sort("created_at", -1).skip(skip).limit(per_page)
    posts_list = [_serialize_post(p, db, user_id) for p in posts_cursor]

    total = db["posts"].count_documents({})

    return jsonify({
        "success": True,
        "data": {
            "posts": posts_list,
            "total": total,
            "page": page,
            "per_page": per_page
        }
    }), 200


# ── Create Post ──

@social_bp.route("/posts", methods=["POST"])
@jwt_required()
def create_post():
    """Create a new social post."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)

    if not data or not data.get("content", "").strip():
        return jsonify({"success": False, "message": "Post content is required."}), 400

    db = get_db()

    post_doc = {
        "author_id": ObjectId(user_id),
        "content": data["content"].strip(),
        "image_url": data.get("image_url"),
        "video_url": data.get("video_url"),
        "likes": [],
        "comments": [],
        "created_at": datetime.now(timezone.utc),
    }

    result = db["posts"].insert_one(post_doc)
    
    # Notify all users about new community post
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        author_name = user.get("full_name", "Someone")
        
        # Notify everyone except the author
        users_cursor = db["users"].find({"_id": {"$ne": ObjectId(user_id)}}, {"_id": 1})
        for u in users_cursor:
            create_notification(
                db,
                user_id=u["_id"],
                type_str="social",
                title="New Community Feed",
                message=f"{author_name} shared a new post: '{post_doc['content'][:50]}...'",
                link="/community"
            )
    except Exception as e:
        print(f"Social notification error: {e}")

    return jsonify({
        "success": True,
        "message": "Post created successfully!",
        "data": {"id": str(result.inserted_id)}
    }), 201


# ── Get My Posts ──

@social_bp.route("/my-posts", methods=["GET"])
@jwt_required()
def get_my_posts():
    """Get posts created by the current user."""
    user_id = get_jwt_identity()
    db = get_db()
    
    posts_cursor = db["posts"].find({"author_id": ObjectId(user_id)}).sort("created_at", -1)
    posts_list = [_serialize_post(p, db, user_id) for p in posts_cursor]
    
    return jsonify({
        "success": True,
        "data": {"posts": posts_list}
    }), 200


# ── Get Single Post ──

@social_bp.route("/posts/<post_id>", methods=["GET"])
@jwt_required()
def get_post(post_id):
    """Get a single post with full details."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        post = db["posts"].find_one({"_id": ObjectId(post_id)})
    except:
        return jsonify({"success": False, "message": "Invalid post ID."}), 400

    if not post:
        return jsonify({"success": False, "message": "Post not found."}), 404

    return jsonify({
        "success": True,
        "data": {"post": _serialize_post(post, db, user_id)}
    }), 200


# ── Like / Unlike Post ──

@social_bp.route("/posts/<post_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(post_id):
    """Toggle like on a post."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        oid = ObjectId(post_id)
        uid = ObjectId(user_id)
    except:
        return jsonify({"success": False, "message": "Invalid ID."}), 400

    post = db["posts"].find_one({"_id": oid})
    if not post:
        return jsonify({"success": False, "message": "Post not found."}), 404

    if uid in post.get("likes", []):
        db["posts"].update_one({"_id": oid}, {"$pull": {"likes": uid}})
        return jsonify({"success": True, "message": "Post unliked.", "data": {"liked": False}}), 200
    else:
        db["posts"].update_one({"_id": oid}, {"$addToSet": {"likes": uid}})
        return jsonify({"success": True, "message": "Post liked!", "data": {"liked": True}}), 200


# ── Add Comment ──

@social_bp.route("/posts/<post_id>/comments", methods=["POST"])
@jwt_required()
def add_comment(post_id):
    """Add a comment to a post."""
    user_id = get_jwt_identity()
    data = request.get_json(silent=True)

    if not data or not data.get("text", "").strip():
        return jsonify({"success": False, "message": "Comment text is required."}), 400

    db = get_db()

    # Get author name
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    author_name = user.get("full_name", "Anonymous") if user else "Anonymous"

    comment = {
        "_id": ObjectId(),
        "author_id": ObjectId(user_id),
        "author_name": author_name,
        "text": data["text"].strip(),
        "created_at": datetime.now(timezone.utc),
    }

    db["posts"].update_one(
        {"_id": ObjectId(post_id)},
        {"$push": {"comments": comment}}
    )

    return jsonify({
        "success": True,
        "message": "Comment added!",
    }), 201


# ── Delete Post ──

@social_bp.route("/posts/<post_id>", methods=["DELETE"])
@jwt_required()
def delete_post(post_id):
    """Delete a post (only by author or admin)."""
    user_id = get_jwt_identity()
    db = get_db()

    try:
        post = db["posts"].find_one({"_id": ObjectId(post_id)})
    except:
        return jsonify({"success": False, "message": "Invalid post ID."}), 400

    if not post:
        return jsonify({"success": False, "message": "Post not found."}), 404

    # Only author or admin can delete
    if str(post["author_id"]) != user_id:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or user.get("role") != "admin":
            return jsonify({"success": False, "message": "Access denied."}), 403

    db["posts"].delete_one({"_id": ObjectId(post_id)})

    return jsonify({"success": True, "message": "Post deleted."}), 200
