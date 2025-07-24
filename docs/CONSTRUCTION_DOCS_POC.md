# Construction Technical Documentation System - POC

## 🎯 Overview

A proof-of-concept system for processing and searching technical construction documentation. The system processes PDFs page-by-page, generates AI summaries and metadata tags, and provides a mobile-friendly search interface.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Supabase account
- OpenAI API key
- Required Python packages: `pip install PyPDF2 supabase openai sentence-transformers fastapi uvicorn fpdf2`

### 1. Environment Setup

Create a `.env` file in the project root:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 2. Database Setup

Run the schema deployment script:
```bash
python scripts/deploy_construction_schema.py
```

Then copy the SQL from `database/schemas/construction_schema.sql` and run it in your Supabase SQL Editor.

### 3. Process a Document

```bash
# Process a PDF document
python tools/construction_doc_processor.py path/to/document.pdf HVAC

# Or run the test system with sample data
python tools/test_construction_system.py
```

### 4. Start the API Server

```bash
python src/construction_search_api.py
```

The API will be available at `http://localhost:8000`

### 5. Open the Search Interface

Open `frontend/construction-search.html` in your web browser.

## 📊 System Architecture

```
PDF Document → Page Processor → AI Summary/Tags → Supabase Storage
                                                          ↓
Mobile Interface ← Search API ← Vector/Text Search ← Embeddings
```

## 🔍 Key Features

### Document Processing
- **Page-by-page processing** - Each page treated as a searchable unit
- **AI-generated summaries** - 2-3 sentence summary per page
- **Smart tagging** - 4-5 relevant tags per page (diagram, specifications, installation, etc.)
- **System categorization** - HVAC, Electrical, Plumbing, Fire-Safety, Structural

### Search Capabilities
1. **Text Search** - Full-text search across all pages
2. **Semantic Search** - Find similar content using embeddings
3. **Tag Search** - Quick filtering by content type
4. **System Filtering** - Filter results by system category

### Mobile Interface
- **Responsive design** - Works on phones, tablets, and desktop
- **Voice search** - Hands-free search for field use
- **Quick tag buttons** - One-tap access to common searches
- **Page preview** - See summaries before opening full content

## 📁 File Structure

```
Echo/Altus/
├── tools/
│   ├── construction_doc_processor.py  # PDF processing script
│   └── test_construction_system.py    # Test script with sample PDF
├── src/
│   └── construction_search_api.py     # FastAPI search endpoints
├── frontend/
│   └── construction-search.html       # Mobile-friendly interface
├── database/schemas/
│   └── construction_schema.sql        # Supabase database schema
├── scripts/
│   └── deploy_construction_schema.py  # Schema deployment helper
└── docs/
    └── CONSTRUCTION_DOCS_POC.md      # This file
```

## 🔧 API Endpoints

- `GET /` - Health check
- `GET /search/text?q={query}&system={system}` - Full-text search
- `GET /search/semantic?q={query}` - Semantic similarity search
- `GET /search/tags?tags={tag1}&tags={tag2}` - Search by tags
- `GET /browse/{system}` - Browse all pages for a system
- `GET /systems` - List all systems with page counts
- `GET /documents` - List all uploaded documents
- `GET /page/{page_id}` - Get full page content

## 📝 Metadata Structure

Each page is stored with:
```json
{
    "page_number": 47,
    "system": "HVAC",
    "tags": ["diagram", "installation", "clearances", "outdoor"],
    "summary": "Installation diagram showing minimum clearance requirements for outdoor condensing units..."
}
```

## 🎪 Demo Scenarios

1. **Find Installation Instructions**
   - Search: "installation clearance"
   - Result: Pages with installation diagrams and clearance specs

2. **Troubleshoot Error Code**
   - Search: "error code E03"
   - Result: Troubleshooting page with E03 diagnosis steps

3. **Browse Diagrams**
   - Click: "📊 Diagrams" tag button
   - Result: All pages containing diagrams

4. **System-Specific Search**
   - Select: "HVAC" from dropdown
   - Search: "specifications"
   - Result: Only HVAC specification pages

## 🚧 Limitations (POC)

- Basic PDF text extraction (no OCR for scanned documents)
- Simple page-level chunking (no semantic chunking yet)
- Limited to 5000 tokens per page for AI processing
- No user authentication or permissions
- No offline sync (requires internet connection)

## 🔮 Next Steps

1. **Enhanced Processing**
   - Add OCR for scanned PDFs
   - Implement semantic chunking for better context
   - Extract tables and diagrams as structured data

2. **Mobile App**
   - Native iOS/Android apps
   - Offline synchronization
   - Push notifications for updates

3. **Collaboration**
   - User authentication and permissions
   - Team annotations and notes
   - Version tracking for document updates

4. **AI Assistant**
   - Natural language Q&A about documents
   - Step-by-step guidance for procedures
   - Cross-reference related information

## 🐛 Troubleshooting

**"Tables not found" error**
- Make sure to run the SQL schema in Supabase SQL Editor
- Check that your database URL and keys are correct

**"No embedding model" error**
- First run will download the embedding model (~90MB)
- Ensure you have internet connection

**Search returns no results**
- Check that documents were processed successfully
- Verify the API server is running
- Try broader search terms or different tags

## 📞 Support

This is a proof of concept demonstration. For production deployment, additional security, error handling, and scalability considerations should be implemented.