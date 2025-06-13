from fastapi.testclient import TestClient
from app import app
import pytest

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "InnerVoice API is running"}

def test_analyze_emotion():
    test_text = "I am feeling very happy today!"
    response = client.post("/analyze", json={"text": test_text})
    assert response.status_code == 200
    data = response.json()
    assert "label" in data
    assert "confidence" in data
    assert isinstance(data["confidence"], float)
    assert 0 <= data["confidence"] <= 1

def test_analyze_emotion_empty_text():
    response = client.post("/analyze", json={"text": ""})
    assert response.status_code == 400
    assert "detail" in response.json()

def test_analyze_emotion_invalid_input():
    response = client.post("/analyze", json={"invalid": "input"})
    assert response.status_code == 422  # Validation error

@pytest.mark.asyncio
async def test_emotion_model():
    from models.emotion_model import analyze_emotion
    
    # Test with positive text
    result = await analyze_emotion("I am feeling very happy today!")
    assert "label" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)
    assert 0 <= result["confidence"] <= 1

    # Test with negative text
    result = await analyze_emotion("I am feeling sad and disappointed")
    assert "label" in result
    assert "confidence" in result
    assert isinstance(result["confidence"], float)
    assert 0 <= result["confidence"] <= 1 