# Deployment Guide

## GitHub Pages Setup

### 1. Repository Settings
1. Go to your GitHub repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"

### 2. Environment Variables
Add these secrets in your repository settings:
- `VITE_RAPIDAPI_KEY`: Your RapidAPI key from https://rapidapi.com/ytjar/api/youtube-mp36/

### 3. API Key Setup
1. Sign up for [RapidAPI](https://rapidapi.com/)
2. Subscribe to [YouTube MP3 API](https://rapidapi.com/ytjar/api/youtube-mp36/)
3. Copy your API key
4. Add it to GitHub repository secrets as `VITE_RAPIDAPI_KEY`

### 4. Deployment Process
The deployment is automatic via GitHub Actions:
- Push to `main` branch triggers deployment
- Tests run first, then build, then deploy
- Site will be available at: `https://yourusername.github.io/YT2MP3Dpwnload/`

### 5. Local Development
```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API key to .env
VITE_RAPIDAPI_KEY=your_api_key_here

# Start development server
npm run dev
```

### 6. Manual Deployment
```bash
# Build and deploy manually
npm run build
npm run deploy
```

## Troubleshooting

### Common Issues
1. **API Key Missing**: Ensure `VITE_RAPIDAPI_KEY` is set in GitHub secrets
2. **Build Fails**: Check that all dependencies are correctly installed
3. **Tests Fail**: Run `npm test` locally to debug

### GitHub Actions Status
Check the Actions tab in your repository to see deployment status and logs.
