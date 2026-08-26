import cv2
import numpy as np


def load_image(image_bytes):
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    return cv2.imdecode(array, cv2.IMREAD_COLOR)


def error_level_analysis(image, quality=90):
    success, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        return None
    recompressed = cv2.imdecode(encoded, cv2.IMREAD_COLOR)

    diff = cv2.absdiff(image, recompressed)
    diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
    return diff_gray


def detect_tampering(image_bytes):
    image = load_image(image_bytes)
    if image is None:
        return {"checked": False, "reason": "invalid_image"}

    ela_map = error_level_analysis(image)
    if ela_map is None:
        return {"checked": False, "reason": "ela_failed"}

    mean_intensity = float(np.mean(ela_map))
    max_intensity = float(np.max(ela_map))
    std_intensity = float(np.std(ela_map))

    suspicious_ratio = float(np.sum(ela_map > (mean_intensity + 2 * std_intensity)) / ela_map.size)

    is_suspicious = suspicious_ratio > 0.02 or max_intensity > 180

    return {
        "checked": True,
        "mean_error_level": round(mean_intensity, 2),
        "max_error_level": round(max_intensity, 2),
        "suspicious_region_ratio": round(suspicious_ratio, 4),
        "verdict": "needs_review" if is_suspicious else "likely_authentic",
        "note": "Error-level analysis flags regions with inconsistent compression, which can indicate localized editing. Not conclusive proof of forgery."
    }