#!/bin/bash
set -e

# Configuration
PROJECT_ID="project-9e091b7d-1e8e-4a4e-963"
REGION="us-central1"
GOOGLE_CLIENT_ID="87748455115-483j472l7c7scjkcm8qpguen8jaa4ie6.apps.googleusercontent.com"
BACKEND_IMAGE="gcr.io/${PROJECT_ID}/daa-crm-backend:latest"
FRONTEND_IMAGE="gcr.io/${PROJECT_ID}/daa-crm-frontend:latest"

echo "==================================================="
echo "🚀 Deploying Detroit Automation Academy Registration to Google Cloud Platform"
echo "Project: $PROJECT_ID (Free Trial Account)"
echo "==================================================="

# 1. Build and Push Backend using Cloud Build (No local Docker required)
echo "1. Building and pushing backend image via Cloud Build..."
cd backend
gcloud builds submit --tag $BACKEND_IMAGE .
cd ..

# 2. Build and Push Frontend using Cloud Build
echo "2. Building and pushing frontend image via Cloud Build..."
cd frontend
gcloud builds submit --tag $FRONTEND_IMAGE .
cd ..

# 3. Deploy to Cloud Run
echo "3. Deploying to Cloud Run..."

gcloud run deploy daa-crm-backend \
  --image $BACKEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --project $PROJECT_ID --set-env-vars GOOGLE_CLIENT_ID="87748455115-483j472l7c7scjkcm8qpguen8jaa4ie6.apps.googleusercontent.com"

gcloud run deploy daa-crm-frontend \
  --image $FRONTEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --project $PROJECT_ID --set-env-vars GOOGLE_CLIENT_ID="87748455115-483j472l7c7scjkcm8qpguen8jaa4ie6.apps.googleusercontent.com"

echo "==================================================="
echo "✅ Deployment completed successfully!"
echo "==================================================="
