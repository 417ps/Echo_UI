#!/usr/bin/env python3
"""
Construction Documentation Search API
FastAPI endpoints for searching technical documentation
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
from pydantic import BaseModel
import os
from supabase import create_client, Client
try:
    from sentence_transformers import SentenceTransformer
    HAS_EMBEDDINGS = True
except ImportError:
    HAS_EMBEDDINGS = False
    print("⚠️ Sentence transformers not available, semantic search disabled")
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Construction Docs Search API", version="1.0.0")

# Add CORS middleware for mobile access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

# Initialize embedding model
if HAS_EMBEDDINGS:
    print("🤖 Loading embedding model...")
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
else:
    embedding_model = None

# Response models
class SearchResult(BaseModel):
    id: str
    document_name: str
    page_number: int
    system: str
    tags: List[str]
    summary: str
    similarity: Optional[float] = None
    rank: Optional[float] = None

class SearchResponse(BaseModel):
    query: str
    system_filter: Optional[str]
    results: List[SearchResult]
    total_results: int

class SystemInfo(BaseModel):
    system: str
    page_count: int
    common_tags: List[str]

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Construction Documentation Search API",
        "endpoints": [
            "/search/text",
            "/search/tags", 
            "/search/semantic",
            "/browse/{system}",
            "/systems",
            "/documents"
        ]
    }

@app.get("/search/text", response_model=SearchResponse)
async def search_text(
    q: str = Query(..., description="Search query"),
    system: Optional[str] = Query(None, description="Filter by system (HVAC, Electrical, etc.)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum results to return")
):
    """
    Full-text search across all documentation
    """
    try:
        # Use Supabase RPC function for full-text search
        result = supabase.rpc('search_construction_text', {
            'search_query': q,
            'system_filter': system,
            'limit_results': limit
        }).execute()
        
        results = []
        for item in result.data:
            results.append(SearchResult(
                id=item['id'],
                document_name=item['document_name'],
                page_number=item['page_number'],
                system=item['system'],
                tags=item['tags'],
                summary=item['summary'],
                rank=item.get('rank')
            ))
        
        return SearchResponse(
            query=q,
            system_filter=system,
            results=results,
            total_results=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search/semantic", response_model=SearchResponse)
async def search_semantic(
    q: str = Query(..., description="Search query"),
    system: Optional[str] = Query(None, description="Filter by system"),
    threshold: float = Query(0.5, ge=0, le=1, description="Similarity threshold"),
    limit: int = Query(10, ge=1, le=50, description="Maximum results")
):
    """
    Semantic similarity search using embeddings
    """
    if not HAS_EMBEDDINGS:
        raise HTTPException(status_code=503, detail="Semantic search not available - embeddings disabled")
    
    try:
        # Generate embedding for query
        query_embedding = embedding_model.encode(q).tolist()
        
        # Use Supabase RPC function for semantic search
        result = supabase.rpc('search_construction_pages', {
            'query_embedding': query_embedding,
            'match_threshold': threshold,
            'match_count': limit,
            'system_filter': system
        }).execute()
        
        results = []
        for item in result.data:
            results.append(SearchResult(
                id=item['id'],
                document_name=item['document_name'],
                page_number=item['page_number'],
                system=item['system'],
                tags=item['tags'],
                summary=item['summary'],
                similarity=item['similarity']
            ))
        
        return SearchResponse(
            query=q,
            system_filter=system,
            results=results,
            total_results=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/search/tags", response_model=SearchResponse)
async def search_by_tags(
    tags: List[str] = Query(..., description="Tags to search for"),
    system: Optional[str] = Query(None, description="Filter by system")
):
    """
    Search pages by tags (e.g., 'diagram', 'installation', 'troubleshooting')
    """
    try:
        # Use Supabase RPC function for tag search
        result = supabase.rpc('search_by_tags', {
            'search_tags': tags,
            'system_filter': system
        }).execute()
        
        results = []
        for item in result.data:
            results.append(SearchResult(
                id=item['id'],
                document_name=item['document_name'],
                page_number=item['page_number'],
                system=item['system'],
                tags=item['tags'],
                summary=item['summary']
            ))
        
        return SearchResponse(
            query=f"tags: {', '.join(tags)}",
            system_filter=system,
            results=results,
            total_results=len(results)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/browse/{system}")
async def browse_system(
    system: str,
    tag: Optional[str] = Query(None, description="Filter by specific tag"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Results per page")
):
    """
    Browse all pages for a specific system
    """
    try:
        # Build query
        query = supabase.table('construction_pages').select('*').eq('system', system)
        
        # Add tag filter if provided
        if tag:
            query = query.contains('tags', [tag])
        
        # Add pagination
        offset = (page - 1) * per_page
        query = query.order('document_name', desc=False).order('page_number', desc=False)
        query = query.range(offset, offset + per_page - 1)
        
        result = query.execute()
        
        # Get total count
        count_query = supabase.table('construction_pages').select('id', count='exact').eq('system', system)
        if tag:
            count_query = count_query.contains('tags', [tag])
        count_result = count_query.execute()
        
        total_count = count_result.count if hasattr(count_result, 'count') else len(result.data)
        
        return {
            'system': system,
            'tag_filter': tag,
            'page': page,
            'per_page': per_page,
            'total_pages': (total_count + per_page - 1) // per_page,
            'total_results': total_count,
            'results': result.data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/systems", response_model=List[SystemInfo])
async def get_systems():
    """
    Get list of all systems with page counts and common tags
    """
    try:
        # Get unique systems with counts
        result = supabase.table('construction_pages').select('system').execute()
        
        # Count pages per system and get common tags
        systems_data = {}
        for row in result.data:
            system = row['system']
            if system not in systems_data:
                systems_data[system] = {'count': 0, 'tags': {}}
            systems_data[system]['count'] += 1
        
        # Get common tags per system
        for system in systems_data:
            tags_result = supabase.table('construction_pages')\
                .select('tags')\
                .eq('system', system)\
                .limit(100)\
                .execute()
            
            tag_counts = {}
            for row in tags_result.data:
                for tag in row['tags']:
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
            
            # Get top 5 tags
            common_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            systems_data[system]['tags'] = [tag[0] for tag in common_tags]
        
        # Format response
        response = []
        for system, data in systems_data.items():
            response.append(SystemInfo(
                system=system,
                page_count=data['count'],
                common_tags=data['tags']
            ))
        
        return sorted(response, key=lambda x: x.page_count, reverse=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def get_documents(
    system: Optional[str] = Query(None, description="Filter by system")
):
    """
    Get list of all uploaded documents
    """
    try:
        query = supabase.table('construction_documents').select('*')
        
        if system:
            query = query.eq('system_category', system)
        
        result = query.order('uploaded_at', desc=True).execute()
        
        return {
            'total_documents': len(result.data),
            'documents': result.data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/page/{page_id}")
async def get_page_content(page_id: str):
    """
    Get full content of a specific page
    """
    try:
        result = supabase.table('construction_pages')\
            .select('*')\
            .eq('id', page_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Page not found")
        
        return result.data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)