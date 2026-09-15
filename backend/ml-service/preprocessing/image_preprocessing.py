import cv2
import numpy as np

BLUR_THRESHOLD = 100.0
DARKNESS_THRESHOLD = 60.0
BRIGHTNESS_THRESHOLD = 220.0
LOW_RES_THRESHOLD = 900


def load_image_from_bytes(image_bytes):
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    return image


def encode_image_to_bytes(image, quality=95):
    success, encoded = cv2.imencode(".jpg", image, [cv2.IMWRITE_JPEG_QUALITY, quality])
    if not success:
        raise ValueError("Failed to encode processed image")
    return encoded.tobytes()


def correct_illumination(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    background = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, np.ones((25, 25), np.uint8))
    normalized = cv2.divide(gray, background, scale=255)

    normalized_bgr = cv2.cvtColor(normalized, cv2.COLOR_GRAY2BGR)
    lab_orig = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    lab_norm = cv2.cvtColor(normalized_bgr, cv2.COLOR_BGR2LAB)
    l_norm, _, _ = cv2.split(lab_norm)
    _, a_orig, b_orig = cv2.split(lab_orig)
    merged = cv2.merge((l_norm, a_orig, b_orig))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def deskew(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))

    if coords.shape[0] < 50:
        return image

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle

    if abs(angle) < 0.5 or abs(angle) > 15:
        return image

    height, width = image.shape[:2]
    center = (width // 2, height // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    return cv2.warpAffine(
        image, matrix, (width, height),
        flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE
    )


def denoise(image):
    return cv2.fastNlMeansDenoisingColored(image, None, 8, 8, 7, 21)


def enhance_contrast(image):
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    l_channel, a_channel, b_channel = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8))
    l_enhanced = clahe.apply(l_channel)
    merged = cv2.merge((l_enhanced, a_channel, b_channel))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def sharpen_text(image):
    gaussian = cv2.GaussianBlur(image, (0, 0), sigmaX=3)
    sharpened = cv2.addWeighted(image, 1.5, gaussian, -0.5, 0)
    return sharpened


def super_resolve_if_small(image, min_dimension=LOW_RES_THRESHOLD):
    height, width = image.shape[:2]
    if min(height, width) >= min_dimension:
        return image

    scale = min_dimension / min(height, width)
    new_size = (int(width * scale), int(height * scale))
    return cv2.resize(image, new_size, interpolation=cv2.INTER_CUBIC)


def auto_crop_border(image, margin_ratio=0.02):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return image

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    height, width = image.shape[:2]
    original_aspect = width / height
    crop_aspect = w / h if h > 0 else 0

    covers_most_of_image = (w >= width * 0.75) and (h >= height * 0.75)
    aspect_is_similar = abs(crop_aspect - original_aspect) < 0.3

    if not covers_most_of_image or not aspect_is_similar:
        return image

    margin_x = int(w * margin_ratio)
    margin_y = int(h * margin_ratio)
    x0 = max(0, x - margin_x)
    y0 = max(0, y - margin_y)
    x1 = min(width, x + w + margin_x)
    y1 = min(height, y + h + margin_y)

    return image[y0:y1, x0:x1]


def compute_quality_metrics(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    mean_brightness = float(np.mean(gray))
    height, width = image.shape[:2]

    notes = []
    if blur_score < BLUR_THRESHOLD:
        notes.append("Low sharpness detected.")
    if mean_brightness < DARKNESS_THRESHOLD:
        notes.append("Low brightness detected.")
    if mean_brightness > BRIGHTNESS_THRESHOLD:
        notes.append("Overexposure detected.")
    if min(height, width) < LOW_RES_THRESHOLD:
        notes.append("Low resolution detected.")

    return {
        "blur_score": round(float(blur_score), 2),
        "brightness": round(mean_brightness, 2),
        "resolution": f"{width}x{height}",
        "notes": notes
    }


def preprocess_document(image_bytes):
    image = load_image_from_bytes(image_bytes)
    if image is None:
        return {"success": False, "error": "Could not decode image"}

    quality_before = compute_quality_metrics(image)
    applied = []

    processed = auto_crop_border(image)

    processed_deskewed = deskew(processed)
    if not np.array_equal(processed_deskewed, processed):
        applied.append("Corrected skewed/rotated page angle.")
    processed = processed_deskewed

    processed_resized = super_resolve_if_small(processed)
    if processed_resized.shape != processed.shape:
        applied.append("Upscaled low-resolution image for clearer text.")
    processed = processed_resized

    if quality_before["brightness"] < DARKNESS_THRESHOLD or quality_before["blur_score"] < BLUR_THRESHOLD * 3:
        processed = correct_illumination(processed)
        applied.append("Corrected uneven lighting and shadows.")

    processed = denoise(processed)
    applied.append("Reduced image noise.")

    if quality_before["brightness"] < 200:
        processed = enhance_contrast(processed)
        applied.append("Enhanced contrast for faded text.")

    processed = sharpen_text(processed)
    applied.append("Sharpened text edges.")

    quality_after = compute_quality_metrics(processed)
    processed_bytes = encode_image_to_bytes(processed)

    return {
        "success": True,
        "processed_bytes": processed_bytes,
        "quality_before": quality_before,
        "quality_after": quality_after,
        "enhancements_applied": applied
    }