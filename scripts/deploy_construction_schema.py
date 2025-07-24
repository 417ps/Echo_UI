#!/usr/bin/env python3
"""
Deploy Construction Schema to Supabase
Runs the SQL schema file to set up database tables
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

def deploy_schema():
    """Deploy the construction schema to Supabase"""
    print("🚀 Deploying Construction Schema to Supabase")
    print("=" * 50)
    
    # Initialize Supabase client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Need service role for DDL
    
    if not supabase_url or not supabase_key:
        print("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
        print("   Note: You need the service role key (not anon key) to create tables")
        return False
    
    try:
        # Read schema file
        schema_path = Path(__file__).parent.parent / "database" / "schemas" / "construction_schema.sql"
        
        if not schema_path.exists():
            print(f"❌ Schema file not found: {schema_path}")
            return False
        
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        print(f"📄 Read schema from: {schema_path}")
        
        # Note: Supabase Python client doesn't support direct SQL execution
        # You'll need to run this SQL in Supabase Dashboard SQL Editor
        
        print("\n⚠️  IMPORTANT: The Supabase Python client doesn't support DDL operations.")
        print("\n📋 Please follow these steps:")
        print("1. Go to your Supabase Dashboard")
        print("2. Navigate to SQL Editor")
        print("3. Create a new query")
        print("4. Copy and paste the contents of:")
        print(f"   {schema_path}")
        print("5. Click 'Run' to execute the schema")
        
        print("\n💡 Alternatively, you can use the Supabase CLI:")
        print("   supabase db push")
        
        # Create a temporary file with just the connection info for easy reference
        print("\n📌 Your Supabase project URL:")
        print(f"   {supabase_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_tables():
    """Check if tables were created successfully"""
    print("\n🔍 Checking if tables exist...")
    
    try:
        supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )
        
        # Try to query the tables
        docs_result = supabase.table('construction_documents').select('count').limit(1).execute()
        pages_result = supabase.table('construction_pages').select('count').limit(1).execute()
        
        print("✅ Tables appear to be created successfully!")
        return True
        
    except Exception as e:
        if "relation" in str(e) and "does not exist" in str(e):
            print("⚠️  Tables not found. Please run the schema in Supabase SQL Editor.")
        else:
            print(f"❌ Error checking tables: {e}")
        return False

if __name__ == "__main__":
    if deploy_schema():
        print("\n" + "=" * 50)
        check_tables()