# 🚀 Deployment Instructions for Echo AI

Follow these steps to deploy your Echo AI Construction Intelligence Assistant to GitHub and Vercel.

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository:
   - Name: `echo-ai-construction`
   - Description: "AI-powered construction intelligence assistant with modern web interface"
   - Make it public
   - Don't initialize with README (we already have one)
   - Click "Create repository"

## Step 2: Push to GitHub

Run these commands in your terminal:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/echo-ai-construction.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Website (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: frontend
5. Click "Deploy"

### Option B: Using Vercel CLI

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Follow prompts:
   - Set up and deploy: Yes
   - Scope: Your account
   - Link to existing project: No
   - Project name: echo-ai-construction
   - Directory: ./
   - Override settings: No

## Step 4: Update Configuration

1. Get your Vercel URL (e.g., `https://echo-ai-construction.vercel.app`)

2. Update CORS settings in your n8n webhook:
   - Add your Vercel domain to allowed origins
   - Example: `https://echo-ai-construction.vercel.app`

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Login with demo credentials:
   - Email: `demo@echo.ai`
   - Password: `demo123`
3. Test all features:
   - Chat with AI assistant
   - Navigate between pages
   - Upload documents
   - Check theme switching

## 📝 Post-Deployment

1. Update README with your live URL:
   - Edit `README-FRONTEND.md`
   - Replace `[Your Vercel URL will be here]` with actual URL

2. Share your project:
   - Tweet about it
   - Share on LinkedIn
   - Add to your portfolio

## 🎉 Congratulations!

Your Echo AI Construction Intelligence Assistant is now live!

## Troubleshooting

### If pages don't load correctly:
- Check the browser console for errors
- Ensure all file paths are correct
- Verify the vercel.json configuration

### If n8n webhook doesn't work:
- Check CORS settings
- Verify webhook URL is correct
- Test webhook independently

### If theme doesn't persist:
- Check localStorage permissions
- Clear browser cache and try again

---

Need help? Open an issue on GitHub!