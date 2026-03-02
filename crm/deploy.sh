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

# 1. Build and Push Backend using Cloud Build
echo "1. Building and pushing backend image..."
cd backend
gcloud builds submit --tag $BACKEND_IMAGE .
cd ..

# 2. Deploy Backend to Cloud Run (to get its URL)
echo "2. Deploying backend service..."
gcloud run deploy daa-crm-backend \
  --image $BACKEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --project $PROJECT_ID \
  --set-env-vars GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID",POSTMARK_SERVER_TOKEN="DAA-POSTMARK-TOKEN",SENDER_EMAIL="info@detroitautomationacademy.com",ADMIN_EMAIL="smit4786@gmail.com" \
  --quiet

# Get backend URL
BACKEND_URL=$(gcloud run services describe daa-crm-backend --platform managed --region $REGION --format='value(status.url)' --project $PROJECT_ID)
echo "🔗 Backend URL: $BACKEND_URL"

# 3. Build and Push Frontend using Cloud Build
echo "3. Injecting backend URL into frontend environment and building..."
cd frontend
# Create .env file with the active backend URL for build process
echo "REACT_APP_API_BASE_URL=$BACKEND_URL" > .env
gcloud builds submit --tag $FRONTEND_IMAGE .
cd ..

# 4. Deploy Frontend to Cloud Run
echo "4. Deploying frontend service..."
gcloud run deploy daa-crm-frontend \
  --image $FRONTEND_IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 80 \
  --project $PROJECT_ID \
  --set-env-vars GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID",REACT_APP_API_BASE_URL="$BACKEND_URL" \
  --quiet

echo "==================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 Frontend URL: $(gcloud run services describe daa-crm-frontend --platform managed --region $REGION --format='value(status.url)' --project $PROJECT_ID)"
echo "==================================================="
