# InnerVoice Backend

This is the FastAPI backend for the InnerVoice AI-powered mental health journaling platform.

## Features
- Emotion analysis using HuggingFace DistilBERT model
- CORS enabled for frontend integration

## Setup

1. **Clone the repository**
2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## Running Locally

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 10000
```

## Deployment
- Deploy to [Render](https://render.com/)
- Use the following start command:
  ```bash
  uvicorn app:app --host 0.0.0.0 --port 10000
  ```
- Set CORS origins to your frontend URL in `app.py` for production

## API Endpoints
- `GET /` — Health check
- `POST /analyze-emotion/` — Analyze emotion from text (body: `text`)

## Notes
- No paid APIs or keys required
- Model is loaded from HuggingFace Hub (free tier) 