# InnerVoice - AI-Powered Mental Health Journaling Platform

InnerVoice is a modern web application that helps users track their emotional well-being through journaling and AI-powered emotion analysis.

## Features

- 📝 Clean and intuitive journaling interface
- 🤖 AI-powered emotion analysis using state-of-the-art NLP models
- 📊 Interactive emotion trend visualization
- 📱 Responsive design for all devices
- 🌙 Dark mode support
- 📈 Emotion analytics and insights
- 👍 User feedback on emotion analysis accuracy

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: FastAPI, Python
- **AI Model**: HuggingFace Transformers (RoBERTa)
- **Deployment**: Vercel (Frontend), Railway (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Git

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the development server:
   ```bash
   uvicorn app:app --reload
   ```

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:8000
- API documentation available at http://localhost:8000/docs

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [HuggingFace](https://huggingface.co/) for the emotion analysis model
- [Vercel](https://vercel.com) for frontend hosting
- [Railway](https://railway.app) for backend hosting 