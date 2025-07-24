#!/usr/bin/env python3
"""
Construction Document Processor
Processes technical PDFs page-by-page with AI-generated summaries and metadata
"""

import os
import sys
import json
import asyncio
from typing import List, Dict, Optional
from datetime import datetime
import PyPDF2
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client, Client
try:
    from sentence_transformers import SentenceTransformer
    HAS_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAS_SENTENCE_TRANSFORMERS = False
    print("⚠️ sentence-transformers not available, embeddings will be disabled")
from openai import OpenAI  # Perplexity uses OpenAI-compatible API
from dotenv import load_dotenv
import requests

load_dotenv()

class ConstructionDocProcessor:
    """Process construction technical documents with page-level analysis"""
    
    def __init__(self):
        # Initialize Supabase
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_ANON_KEY")
        )
        
        # Initialize Perplexity client (OpenAI-compatible)
        perplexity_key = os.getenv("PERPLEXITY_API_KEY")
        if perplexity_key:
            self.ai_client = OpenAI(
                api_key=perplexity_key,
                base_url="https://api.perplexity.ai"
            )
            self.ai_model = "sonar-small-chat"  # Fast Perplexity model for summaries
        else:
            print("⚠️ PERPLEXITY_API_KEY not found, using fallback summaries")
            self.ai_client = None
        
        # Initialize embedding model
        if HAS_SENTENCE_TRANSFORMERS:
            print("🤖 Loading embedding model...")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            print("⚠️ Embeddings disabled - install sentence-transformers for semantic search")
            self.embedding_model = None
        
        # System categories
        self.systems = ["HVAC", "Electrical", "Plumbing", "Fire-Safety", "Structural", "General"]
        
        # Common technical tags
        self.common_tags = [
            "diagram", "specifications", "installation", "maintenance",
            "troubleshooting", "parts-list", "warnings", "requirements",
            "procedures", "testing", "commissioning", "safety",
            "dimensions", "electrical", "mechanical", "reference",
            "table", "checklist", "error-codes", "settings"
        ]
    
    async def process_pdf(self, pdf_path: str, system_hint: Optional[str] = None) -> Dict:
        """Process entire PDF document page by page"""
        print(f"📄 Processing: {pdf_path}")
        
        # Extract basic info
        pdf_name = Path(pdf_path).name
        
        # Create document record
        doc_result = self.supabase.table('construction_documents').insert({
            'document_name': pdf_name,
            'document_type': 'manual',
            'system_category': system_hint or 'General',
            'uploaded_at': datetime.now().isoformat()
        }).execute()
        
        document_id = doc_result.data[0]['id']
        
        # Process PDF
        results = []
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            total_pages = len(pdf_reader.pages)
            
            print(f"📚 Found {total_pages} pages to process...")
            
            for page_num in range(total_pages):
                print(f"📖 Processing page {page_num + 1}/{total_pages}...")
                
                # Extract page text
                page = pdf_reader.pages[page_num]
                page_text = page.extract_text()
                
                # Skip empty pages
                if not page_text.strip():
                    continue
                
                # Process page
                page_data = await self.process_page(
                    page_text=page_text,
                    page_num=page_num + 1,
                    document_id=document_id,
                    document_name=pdf_name,
                    system_hint=system_hint
                )
                
                results.append(page_data)
                
                # Progress update every 10 pages
                if (page_num + 1) % 10 == 0:
                    print(f"✅ Processed {page_num + 1}/{total_pages} pages")
        
        print(f"🎉 Completed! Processed {len(results)} pages")
        return {
            'document_id': document_id,
            'document_name': pdf_name,
            'total_pages': total_pages,
            'processed_pages': len(results),
            'system': system_hint or 'General'
        }
    
    async def process_page(self, page_text: str, page_num: int, 
                          document_id: str, document_name: str,
                          system_hint: Optional[str] = None) -> Dict:
        """Process a single page"""
        
        # Identify system if not provided
        system = system_hint or self.identify_system(page_text, document_name)
        
        # Generate summary
        summary = await self.generate_summary(page_text)
        
        # Generate tags
        tags = await self.generate_tags(page_text)
        
        # Generate embedding
        if self.embedding_model:
            embedding = self.embedding_model.encode(page_text[:1000]).tolist()
        else:
            # Create a dummy embedding for now
            embedding = [0.0] * 384
        
        # Store in database
        page_data = {
            'document_id': document_id,
            'document_name': document_name,
            'page_number': page_num,
            'system': system,
            'tags': tags,
            'summary': summary,
            'content': page_text,
            'embedding': embedding
        }
        
        result = self.supabase.table('construction_pages').insert(page_data).execute()
        
        return {
            'page_number': page_num,
            'system': system,
            'tags': tags,
            'summary': summary[:100] + '...' if len(summary) > 100 else summary
        }
    
    def identify_system(self, text: str, filename: str) -> str:
        """Identify system category from text content"""
        text_lower = text.lower()
        filename_lower = filename.lower()
        
        # Check filename first
        for system in self.systems:
            if system.lower() in filename_lower:
                return system
        
        # Check content
        system_keywords = {
            "HVAC": ["hvac", "heating", "cooling", "ventilation", "air conditioning", "ahu", "vav"],
            "Electrical": ["electrical", "voltage", "amperage", "circuit", "breaker", "wire", "panel"],
            "Plumbing": ["plumbing", "pipe", "valve", "drain", "water", "flow", "pump"],
            "Fire-Safety": ["fire", "smoke", "alarm", "sprinkler", "emergency", "evacuation"],
            "Structural": ["structural", "beam", "column", "foundation", "load", "concrete", "steel"]
        }
        
        for system, keywords in system_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return system
        
        return "General"
    
    async def generate_summary(self, page_text: str) -> str:
        """Generate concise summary of page content"""
        if not self.ai_client:
            # Fallback summary without AI
            words = page_text.split()[:50]
            return f"Page contains technical content. Preview: {' '.join(words)}..."
            
        try:
            # Limit text to avoid token limits
            text_sample = page_text[:2000]
            
            response = self.ai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{
                    "role": "system",
                    "content": "You are a technical documentation expert. Provide concise 2-3 sentence summaries."
                }, {
                    "role": "user",
                    "content": f"""Summarize this technical documentation page in 2-3 sentences.
Focus on: main topic, key specifications, important procedures or warnings.

Page text:
{text_sample}

Summary:"""
                }],
                max_tokens=100,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"⚠️ Summary generation failed: {e}")
            # Fallback summary
            words = page_text.split()[:30]
            return f"Page contains technical content. Preview: {' '.join(words)}..."
    
    async def generate_tags(self, page_text: str) -> List[str]:
        """Generate 4-5 relevant tags for the page"""
        if not self.ai_client:
            # Use fallback tags
            return self.extract_fallback_tags(page_text)
            
        try:
            # Limit text to avoid token limits
            text_sample = page_text[:1500]
            
            response = self.ai_client.chat.completions.create(
                model=self.ai_model,
                messages=[{
                    "role": "system",
                    "content": "You are a technical documentation tagger. Provide exactly 4-5 single-word tags."
                }, {
                    "role": "user",
                    "content": f"""Analyze this technical documentation page and provide 4-5 single-word tags.

Choose from categories like:
- Content type: diagram, table, specifications, instructions, parts-list, procedures
- Action type: installation, maintenance, troubleshooting, testing, commissioning
- Priority: warnings, critical, safety, reference
- Technical: electrical, mechanical, dimensions, settings

Page text:
{text_sample}

Return exactly 4-5 single words separated by commas. Tags:"""
                }],
                max_tokens=30,
                temperature=0.3
            )
            
            tags_text = response.choices[0].message.content.strip()
            tags = [tag.strip().lower() for tag in tags_text.split(',')][:5]
            
            # Validate tags are single words
            tags = [tag.split()[0] for tag in tags if tag]
            
            return tags
            
        except Exception as e:
            print(f"⚠️ Tag generation failed: {e}")
            # Fallback tags based on content analysis
            return self.extract_fallback_tags(page_text)
    
    def extract_fallback_tags(self, text: str) -> List[str]:
        """Extract tags using simple heuristics"""
        text_lower = text.lower()
        tags = []
        
        # Check for common patterns
        if "diagram" in text_lower or "figure" in text_lower:
            tags.append("diagram")
        if "table" in text_lower or "|" in text:
            tags.append("table")
        if "install" in text_lower:
            tags.append("installation")
        if "warning" in text_lower or "caution" in text_lower:
            tags.append("warnings")
        if "specification" in text_lower or "spec" in text_lower:
            tags.append("specifications")
        if "troubleshoot" in text_lower or "error" in text_lower:
            tags.append("troubleshooting")
        if "part" in text_lower and ("number" in text_lower or "#" in text):
            tags.append("parts-list")
        
        # Ensure we have at least 3 tags
        if len(tags) < 3:
            tags.extend(["reference", "technical", "documentation"])
        
        return tags[:5]


async def main():
    """Test the processor with a sample document"""
    processor = ConstructionDocProcessor()
    
    # Check for command line arguments
    if len(sys.argv) < 2:
        print("Usage: python construction_doc_processor.py <pdf_path> [system]")
        print("Example: python construction_doc_processor.py HVAC_Manual.pdf HVAC")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    system = sys.argv[2] if len(sys.argv) > 2 else None
    
    # Process the document
    result = await processor.process_pdf(pdf_path, system)
    
    print("\n📊 Processing Complete!")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    asyncio.run(main())