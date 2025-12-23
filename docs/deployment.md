# Deployment Guide: FireSafe Hub

This guide provides step-by-step instructions for deploying the FireSafe Hub application to **Vercel** and **Google Cloud Run**.

## 1. Deployment to Vercel (Recommended)

Vercel is the fastest way to deploy this React/Vite application.

### Step-by-Step
1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Import Project**: In the Vercel Dashboard, click "Add New" -> "Project" and import your repository.
3.  **Framework Preset**: Select **Vite** from the dropdown menu.
4.  **Build Settings**: 
    - Build Command: `npm run build` (should be default).
    - Output Directory: `dist` (should be default).
5.  **Environment Variables**:
    - Add a new variable named `API_KEY`.
    - Paste your Google Gemini API key as the value.
6.  **Deploy**: Click "Deploy".

### Why Vite?
Vite is used here to transpile `.tsx` files into standard JavaScript that browsers can understand. It also optimizes your CSS and assets for production.

---

## 2. Deployment to Google Cloud Run

For container-based deployment.

### Step 1: Build Container
```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/firesafe-hub .
```

### Step 2: Deploy
```bash
gcloud run deploy firesafe-hub \
  --image gcr.io/[PROJECT_ID]/firesafe-hub \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars API_KEY=your_key_here
```

---

## Important Technical Notes

1.  **HTTPS Requirement**: Geolocation (GPS) **will not work** on `http://`. You must use the `https://` URL provided by Vercel.
2.  **API Key**: Ensure your Gemini API Key is active. If you see errors in the Safety Assistant, check the Vercel logs for environment variable issues.
