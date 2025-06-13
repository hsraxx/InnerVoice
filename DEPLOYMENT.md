# Deploying InnerVoice

This guide will help you deploy InnerVoice to the web. We'll use Vercel for the frontend and Railway for the backend.

## Prerequisites

1. A GitHub account
2. A Vercel account (sign up at https://vercel.com)
3. A Railway account (sign up at https://railway.app)

## Deploying the Backend (Railway)

1. Push your code to GitHub if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [Railway](https://railway.app) and create a new project
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Python project and set up the deployment
6. Add the following environment variable:
   - `MODEL_NAME=SamLowe/roberta-base-go_emotions`

7. Once deployed, Railway will provide you with a URL. Copy this URL as you'll need it for the frontend deployment.

## Deploying the Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) and create a new project
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add the following environment variable:
   - `VITE_API_URL`: Your Railway backend URL (e.g., https://innervoice-api.up.railway.app)

5. Click "Deploy"

## Verifying the Deployment

1. Once both deployments are complete, visit your Vercel URL
2. Try creating a journal entry to verify the connection to the backend
3. Check the browser's developer tools (F12) to ensure there are no CORS errors

## Troubleshooting

### CORS Issues
If you encounter CORS errors, make sure your backend's CORS settings include your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables
If the application isn't working, verify that:
1. The backend has the correct `MODEL_NAME` environment variable
2. The frontend has the correct `VITE_API_URL` environment variable

### API Connection
To test if the backend is accessible:
1. Visit your Railway URL directly
2. You should see the message "InnerVoice API is running"
3. Try the `/analyze` endpoint with a test request

## Monitoring

- Vercel provides analytics and performance monitoring for the frontend
- Railway provides logs and metrics for the backend
- Check these dashboards if you encounter any issues

## Updating the Deployment

1. Make your changes locally
2. Commit and push to GitHub
3. Both Vercel and Railway will automatically deploy the updates

## Backup and Data Persistence

Currently, the application uses localStorage for data persistence. For a production environment, you might want to:
1. Add a database to the backend (e.g., PostgreSQL)
2. Implement user authentication
3. Store journal entries in the database

Let me know if you need help with any of these additional features! 