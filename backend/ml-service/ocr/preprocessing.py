import cv2
import numpy as np


def load_image(image_bytes):
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    return image


def to_grayscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)


def denoise(image):
    return cv2.fastNlMeansDenoising(image, None, 10, 7, 21)


def deskew(image):
    coords = np.column_stack(np.where(image < 250))
    if coords.shape[0] == 0:
        return image
    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    height, width = image.shape[:2]
    center = (width // 2, height // 2)
    matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, matrix, (width, height), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def adaptive_threshold(image):
    return cv2.adaptiveThreshold(
        image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 15
    )


def preprocess_document(image_bytes):
    image = load_image(image_bytes)
    gray = to_grayscale(image)
    denoised = denoise(gray)
    straightened = deskew(denoised)
    thresholded = adaptive_threshold(straightened)
    return {
        "original": image,
        "processed": thresholded,
        "grayscale": straightened
    }