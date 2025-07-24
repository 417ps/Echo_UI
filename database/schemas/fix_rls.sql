-- Fix Row Level Security for Construction Tables
-- This allows anonymous access for POC testing

-- Disable RLS on construction tables (for POC only)
ALTER TABLE construction_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE construction_pages DISABLE ROW LEVEL SECURITY;

-- Alternative: Create permissive policies for anonymous access
-- Uncomment below if you prefer to keep RLS enabled:

/*
-- Allow anonymous users to insert documents
CREATE POLICY "Allow anon insert documents" ON construction_documents
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to read documents
CREATE POLICY "Allow anon read documents" ON construction_documents
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous users to insert pages
CREATE POLICY "Allow anon insert pages" ON construction_pages
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anonymous users to read pages
CREATE POLICY "Allow anon read pages" ON construction_pages
    FOR SELECT
    TO anon
    USING (true);
*/