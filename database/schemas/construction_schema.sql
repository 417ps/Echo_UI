-- Construction Technical Documentation Schema
-- Stores page-level information from technical manuals with metadata

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Construction documents table
CREATE TABLE IF NOT EXISTS construction_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name TEXT NOT NULL,
    document_type VARCHAR(50) DEFAULT 'manual', -- manual, spec, drawing, guide
    system_category VARCHAR(100), -- HVAC, Electrical, Plumbing, etc.
    total_pages INTEGER,
    file_size BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by UUID REFERENCES auth.users(id),
    project_id UUID, -- For future project association
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Construction pages table (main storage)
CREATE TABLE IF NOT EXISTS construction_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES construction_documents(id) ON DELETE CASCADE,
    document_name TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    system VARCHAR(50) NOT NULL, -- HVAC, Electrical, Plumbing, Fire-Safety, Structural, General
    tags TEXT[] NOT NULL, -- Array of single-word tags
    summary TEXT NOT NULL,
    content TEXT NOT NULL, -- Full page text
    embedding vector(384), -- Embeddings for semantic search
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_page_per_doc UNIQUE (document_id, page_number)
);

-- Indexes for fast searching
CREATE INDEX idx_construction_pages_system ON construction_pages(system);
CREATE INDEX idx_construction_pages_tags ON construction_pages USING GIN(tags);
CREATE INDEX idx_construction_pages_embedding ON construction_pages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_construction_pages_document ON construction_pages(document_id);
CREATE INDEX idx_construction_pages_fulltext ON construction_pages USING GIN(to_tsvector('english', content));

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_construction_pages(
    query_embedding vector(384),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10,
    system_filter text DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_name TEXT,
    page_number INTEGER,
    system VARCHAR(50),
    tags TEXT[],
    summary TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.document_name,
        cp.page_number,
        cp.system,
        cp.tags,
        cp.summary,
        1 - (cp.embedding <=> query_embedding) as similarity
    FROM construction_pages cp
    WHERE 
        (system_filter IS NULL OR cp.system = system_filter)
        AND 1 - (cp.embedding <=> query_embedding) > match_threshold
    ORDER BY cp.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function for tag-based search
CREATE OR REPLACE FUNCTION search_by_tags(
    search_tags TEXT[],
    system_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_name TEXT,
    page_number INTEGER,
    system VARCHAR(50),
    tags TEXT[],
    summary TEXT,
    tag_matches INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.document_name,
        cp.page_number,
        cp.system,
        cp.tags,
        cp.summary,
        cardinality(cp.tags && search_tags) as tag_matches
    FROM construction_pages cp
    WHERE 
        cp.tags && search_tags
        AND (system_filter IS NULL OR cp.system = system_filter)
    ORDER BY cardinality(cp.tags && search_tags) DESC, cp.page_number;
END;
$$;

-- Function for full-text search
CREATE OR REPLACE FUNCTION search_construction_text(
    search_query TEXT,
    system_filter TEXT DEFAULT NULL,
    limit_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    document_name TEXT,
    page_number INTEGER,
    system VARCHAR(50),
    tags TEXT[],
    summary TEXT,
    rank REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id,
        cp.document_name,
        cp.page_number,
        cp.system,
        cp.tags,
        cp.summary,
        ts_rank(to_tsvector('english', cp.content), plainto_tsquery('english', search_query)) as rank
    FROM construction_pages cp
    WHERE 
        to_tsvector('english', cp.content) @@ plainto_tsquery('english', search_query)
        AND (system_filter IS NULL OR cp.system = system_filter)
    ORDER BY rank DESC
    LIMIT limit_results;
END;
$$;

-- Row Level Security
ALTER TABLE construction_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_pages ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to read all documents
CREATE POLICY "Authenticated users can read documents" ON construction_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read pages" ON construction_pages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for document upload (service role only for now)
CREATE POLICY "Service role can insert documents" ON construction_documents
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert pages" ON construction_pages
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Sample data insertion (optional - for testing)
-- INSERT INTO construction_documents (document_name, document_type, system_category) VALUES
-- ('HVAC_Installation_Manual_2024.pdf', 'manual', 'HVAC'),
-- ('Electrical_Code_Requirements.pdf', 'spec', 'Electrical'),
-- ('Plumbing_Troubleshooting_Guide.pdf', 'guide', 'Plumbing');