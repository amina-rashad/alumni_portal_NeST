"""
Date & Time Helper Utilities
Guarantees standard UTC ISO-8601 strings with trailing 'Z' across all backend APIs.
Prevents browser client timezone misinterpretations (e.g., losing +5:30 IST offset).
"""
from datetime import datetime, timezone
import re


def format_datetime_utc(dt):
    """
    Serialize any datetime or date string into an unambiguous UTC ISO-8601 string ending with 'Z'.
    If datetime is naive, it represents UTC (as stored in MongoDB BSON dates).
    """
    if dt is None:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        else:
            dt = dt.astimezone(timezone.utc)
        iso = dt.isoformat()
        if iso.endswith("+00:00"):
            iso = iso[:-6] + "Z"
        elif not iso.endswith("Z"):
            iso += "Z"
        return iso

    s = str(dt).strip()
    if not s or s.lower() in ("none", "null", ""):
        return None

    # Already ends with Z
    if s.endswith("Z"):
        return s

    # Has explicit offset like +05:30 or -04:00
    if re.search(r"[+-]\d{2}(:?\d{2})?$", s):
        try:
            parsed = datetime.fromisoformat(s.replace("Z", "+00:00"))
            return parsed.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
        except Exception:
            return s

    # Naive ISO string (contains T or space between date and time)
    if "T" in s or (" " in s and ":" in s):
        clean = s.replace(" ", "T")
        return clean + "Z"

    return s
