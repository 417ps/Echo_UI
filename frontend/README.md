# Echo Simple Frontend

A lightweight HTML/CSS/JavaScript frontend for the Echo Construction Intelligence Platform.

## Features

- Simple, responsive design
- No build process required
- Direct integration with FastAPI backend
- Basic authentication (login/register)
- Dashboard with key metrics
- Document upload and analysis
- Compliance management view
- Risk analysis display

## Setup

1. **Configure API endpoint**: 
   - Edit `config.js` to set your FastAPI server URL
   - Default is `http://localhost:8000`

2. **Serve the frontend**:
   
   Option A - Python simple server:
   ```bash
   cd frontend
   python -m http.server 3000
   ```
   
   Option B - Node.js server:
   ```bash
   cd frontend
   npx http-server -p 3000
   ```
   
   Option C - Open directly:
   - Simply open `index.html` in your browser
   - Note: Some features may require a proper web server due to CORS

3. **Connect to backend**:
   - Ensure your FastAPI backend is running
   - Update CORS settings in FastAPI to allow frontend origin

## Structure

```
frontend/
├── index.html          # Main HTML file with all pages
├── css/
│   └── styles.css      # All styling
├── js/
│   └── app.js          # Application logic
├── config.js           # Configuration file
└── README.md           # This file
```

## Usage

1. Open the application in your browser
2. Register a new account or login
3. Navigate through:
   - Dashboard: View project metrics
   - Documents: Upload and analyze construction documents
   - Compliance: Check compliance status
   - Risk Analysis: View risk assessments

## Customization

- Modify `styles.css` for visual changes
- Update `app.js` to add new functionality
- Edit `index.html` to modify page structure

## API Integration

The frontend expects these endpoints from your FastAPI backend:

- POST `/api/auth/login`
- POST `/api/auth/register`
- GET `/api/auth/verify`
- POST `/api/documents/upload`
- GET `/api/dashboard/metrics`
- GET `/api/compliance/status`
- GET `/api/risk/analysis`

Ensure your FastAPI backend implements these endpoints or modify `app.js` accordingly.