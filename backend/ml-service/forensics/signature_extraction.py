import cv2
import numpy as np


def crop_bottom_region(image, fraction=0.25):
    height = image.shape[0]
    start_y = int(height * (1 - fraction))
    return image[start_y:height, :]


def extract_signature_region(image_bytes):
    array = np.frombuffer(image_bytes, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        return None
    return crop_bottom_region(image)