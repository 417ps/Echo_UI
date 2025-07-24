# Construction Docs System - Quick Start Guide

## ✅ What's Already Set Up

Your `.env` file already contains working Supabase credentials:
- **Supabase URL**: ✓ Configured
- **Supabase Anon Key**: ✓ Configured  
- **Supabase Service Role Key**: ✓ Configured

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd /Users/personal/projects/Echo/Altus
pip install PyPDF2 supabase sentence-transformers fastapi uvicorn fpdf2
```

### 2. Deploy Database Schema
```bash
# Option A: Using the deploy script
python scripts/deploy_construction_schema.py

# Option B: Manual via Supabase Dashboard
# 1. Go to https://bfvxcfhiaithyagkpttw.supabase.co
# 2. Navigate to SQL Editor
# 3. Copy & paste contents of database/schemas/construction_schema.sql
# 4. Click "Run"
```

### 3. Get Perplexity API Key (Optional)
- Go to https://www.perplexity.ai/settings/api
- Create an API key
- Update `PERPLEXITY_API_KEY` in `.env`

**Note**: The system will work without Perplexity - it will use fallback summaries and tags.

### 4. Run the Demo
```bash
# Create and process a sample PDF
python tools/test_construction_system.py

# Start the API server
python src/construction_search_api.py

# Open the search interface
open frontend/construction-search.html
```

## 📋 Testing the System

1. **Process a real PDF**:
```bash
python tools/construction_doc_processor.py /path/to/manual.pdf HVAC
```

2. **Search via API**:
```bash
# Text search
curl "http://localhost:8000/search/text?q=installation%20clearance"

# Tag search
curl "http://localhost:8000/search/tags?tags=diagram&tags=installation"
```

3. **Use the Web Interface**:
- Open `frontend/construction-search.html`
- Try searching for "clearance requirements"
- Click tag buttons like "Diagrams" or "Troubleshooting"
- Use voice search on mobile

## 🔧 Environment Variables

Your `.env` file needs:
```env
# Already configured
SUPABASE_URL=https://bfvxcfhiaithyagkpttw.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Add this for AI summaries (optional)
PERPLEXITY_API_KEY=your_key_here
```

## 📊 What Gets Stored

For each page:
- **Page Number**: For easy reference
- **System**: HVAC, Electrical, Plumbing, etc.
- **Tags**: 4-5 keywords (diagram, specifications, etc.)
- **Summary**: 2-3 sentence AI summary
- **Full Text**: Complete page content
- **Embeddings**: For semantic search

## 🎯 Key Features

- **Page-by-page processing** - Each page is searchable
- **Smart tagging** - AI identifies content type
- **Multiple search types** - Text, semantic, tags
- **Mobile optimized** - Works great on phones
- **Voice search** - Hands-free in the field

## 🚧 Troubleshooting

**"Table does not exist" error**:
- Run the schema in Supabase SQL Editor
- Make sure you're using the service role key for schema deployment

**No AI summaries**:
- Add Perplexity API key to `.env`
- System still works with fallback summaries

**Can't find pages**:
- Check that PDF was processed successfully
- Try broader search terms
- Use tag search instead of text search

## 📞 Next Steps

Once this POC is working, you can:
1. Process your actual construction manuals
2. Deploy the API to a server
3. Add user authentication
4. Build native mobile apps
5. Add offline sync capability

The system is designed to scale from this simple POC to a full production system!