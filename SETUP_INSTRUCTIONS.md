# Construction Documentation System - Setup Instructions

## Step 1: Create Database Tables

Since the Supabase Python client can't create tables, you need to run the SQL manually:

1. **Go to your Supabase Dashboard**:
   - URL: https://bfvxcfhiaithyagkpttw.supabase.co
   - Navigate to the SQL Editor

2. **Create a new query** and paste this SQL:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Construction documents table
CREATE TABLE IF NOT EXISTS construction_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'manual',
    system_category VARCHAR(100),
    total_pages INTEGER,
    file_size BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID,
    project_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Construction pages table
CREATE TABLE IF NOT EXISTS construction_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES construction_documents(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    system VARCHAR(50) NOT NULL,
    tags TEXT[] NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_page_per_doc UNIQUE (document_id, page_number)
);

-- Create indexes
CREATE INDEX idx_construction_pages_system ON construction_pages(system);
CREATE INDEX idx_construction_pages_tags ON construction_pages USING GIN(tags);
CREATE INDEX idx_construction_pages_embedding ON construction_pages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

3. **Click "RUN"** to execute the SQL

## Step 2: Test the System

Once tables are created, you can run:

```bash
cd /Users/personal/projects/Echo/Altus
python3 tools/test_construction_system.py
```

## Current Status

✅ **Environment Variables**: Configured with working Supabase credentials
✅ **Perplexity API**: Configured for AI summaries
✅ **Code**: Ready to process documents
⏳ **Database Tables**: Need to be created via SQL Editor

## API Key Status

The system is using:
- Supabase project: `bfvxcfhiaithyagkpttw`
- Perplexity API: Configured and ready
- Embeddings: Currently disabled (install sentence-transformers later for semantic search)