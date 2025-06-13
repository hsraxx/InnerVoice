from transformers import pipeline
from functools import lru_cache

EMOTION_LABELS = ["happy", "sad", "angry", "anxious", "calm", "neutral"]

@lru_cache(maxsize=1)
def get_emotion_pipeline():
    return pipeline("text-classification", model="bhadresh-savani/distilbert-base-uncased-emotion", top_k=None)

def get_emotion(text: str):
    pipe = get_emotion_pipeline()
    result = pipe(text)
    # result is a list of dicts with 'label' and 'score'
    # Find the label with the highest score
    if not result or not isinstance(result, list):
        return {"label": "unknown", "confidence": 0.0}
    best = max(result[0], key=lambda x: x['score'])
    return {"label": best['label'], "confidence": best['score'], "all": result[0]} 