#!/bin/bash

# TestRunner Dashboard Deployment Script

echo "🚀 Starting deployment process..."

# Check if .env file exists for backend
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    echo "Please create backend/.env with the following variables:"
    echo "MONGODB_URI=mongodb+srv://..."
    echo "JWT_SECRET=your-secret-key"
    echo "PORT=5000"
    echo "NODE_ENV=production"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "🌐 To start the application:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: Serve the frontend/dist folder"
echo ""
echo "📋 Don't forget to:"
echo "- Set up your MongoDB Atlas database"
echo "- Configure environment variables"
echo "- Set up CORS for your production domain"
echo ""
echo "🎉 Deployment ready!"
