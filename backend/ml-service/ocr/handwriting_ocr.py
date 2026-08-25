from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import numpy as np
import torch

_processor = None
_model = None


def load_handwriting_model():
    global _processor, _model
    if _processor is None or _model is None:
        _processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
        _model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
    return _processor, _model


def extract_handwritten_text(image):
    processor, model = load_handwriting_model()

    if isinstance(image, np.ndarray):
        pil_image = Image.fromarray(image).convert("RGB")
    else:
        pil_image = image.convert("RGB")

    pixel_values = processor(images=pil_image, return_tensors="pt").pixel_values

    with torch.no_grad():
        generated_ids = model.generate(pixel_values, max_length=128)

    text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    return {
        "full_text": text.strip(),
        "confidence": 0.75
    }