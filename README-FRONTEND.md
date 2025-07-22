# Echo AI - Construction Intelligence Assistant

A modern web interface for construction project management with AI-powered assistance. Built with vanilla JavaScript, HTML, and CSS for simplicity and performance.

![Echo AI Interface](https://img.shields.io/badge/Echo%20AI-Construction%20Intelligence-00d4aa?style=for-the-badge)

## 🚀 Live Demo

Visit: [Your Vercel URL will be here]

**Demo Credentials:**
- Email: `demo@echo.ai`
- Password: `demo123`

## ✨ Features

### AI Assistant
- Chat interface integrated with n8n webhook
- Context-aware responses for construction queries
- Building codes and regulations assistance
- Project planning and scheduling help
- Cost estimation and budgeting guidance
- Safety compliance and protocols
- Technical specifications support
- Risk assessment and mitigation

### Dashboard
- Real-time project metrics
- Active projects tracking
- Compliance score monitoring
- Risk alerts
- Document processing statistics
- Recent activity feed

### Document Management
- Drag-and-drop file upload
- Document categorization
- AI-powered document analysis
- Support for PDF, DOC, DOCX, TXT files

### Compliance Management
- Overall compliance score visualization
- Category-wise compliance tracking
- Building codes compliance
- Safety regulations monitoring
- Environmental standards
- Accessibility requirements

### Risk Analysis
- Risk level visualization (Low/Medium/High)
- Financial risk tracking
- Schedule risk assessment
- Safety risk monitoring
- Weather risk alerts
- Active risk mitigation plans

### Settings
- User profile management
- Notification preferences
- AI assistant customization
- Theme switching (Dark/Light mode)

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Custom SVG icons
- **Theme**: Perplexity-inspired dark theme with ChatGPT layout
- **Integration**: n8n webhook for AI responses

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/echo-ai-construction.git
cd echo-ai-construction
```

2. No build process required! Simply serve the files:

**Option A - Python**:
```bash
cd frontend
python -m http.server 3000
```

**Option B - Node.js**:
```bash
cd frontend
npx http-server -p 3000
```

**Option C - VS Code**:
Use the Live Server extension

3. Open http://localhost:3000/index-modern.html in your browser

## 🌐 Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `echo-ai-construction`
   - Directory: `./`
   - Override settings: `N`

## 🔧 Configuration

### n8n Webhook
Update the webhook URL in `frontend/js/modern-app.js`:
```javascript
const N8N_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/echo';
```

### CORS Settings
Ensure your n8n webhook allows CORS from your domain:
- Add your Vercel domain to allowed origins
- Enable credentials if needed

## 📁 Project Structure

```
echo-ai-construction/
├── frontend/
│   ├── index-modern.html    # Main application file
│   ├── css/
│   │   └── modern-styles.css # All styling
│   ├── js/
│   │   └── modern-app.js     # Application logic
│   └── proxy-server.py       # Optional CORS proxy
├── vercel.json              # Vercel configuration
├── .gitignore              # Git ignore file
└── README-FRONTEND.md      # This file
```

## 🎨 Design Features

- **Dark Theme**: Deep black (#0f0f0f) background with teal (#00d4aa) accents
- **Glass Morphism**: Subtle blur effects and transparency
- **Smooth Animations**: CSS transitions for all interactions
- **Responsive Design**: Mobile-friendly layout
- **Custom Scrollbars**: Styled to match theme
- **Toast Notifications**: Non-intrusive user feedback

## 🔐 Security Note

This is a demo frontend. For production use:
- Implement proper authentication
- Use HTTPS for all connections
- Secure your n8n webhook
- Add rate limiting
- Validate all inputs

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspired by Perplexity and ChatGPT
- Built for the construction industry
- Powered by n8n automation

---

Made with ❤️ for construction professionals