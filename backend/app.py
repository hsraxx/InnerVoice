from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models.emotion_model import analyze_emotion

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "http://localhost:3000",  # Alternative local port
        "https://*.vercel.app",   # Vercel deployments
        "https://innervoice.vercel.app",  # Your specific Vercel domain
        "https://*.onrender.com",  # Render deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextInput(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "InnerVoice API is running"}

@app.post("/analyze")
async def analyze_text(input: TextInput):
    if not input.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        result = await analyze_emotion(input.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 