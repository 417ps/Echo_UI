#!/usr/bin/env python3
"""
Test script for Construction Documentation System
Creates a sample PDF and demonstrates the full workflow
"""

import os
import sys
import asyncio
from fpdf import FPDF
from pathlib import Path

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_sample_pdf(filename="HVAC_Sample_Manual.pdf"):
    """Create a sample technical manual PDF for testing"""
    pdf = FPDF()
    
    # Page 1: Title and Safety
    pdf.add_page()
    pdf.set_font("Arial", "B", 24)
    pdf.cell(0, 20, "HVAC Installation Manual", ln=True, align='C')
    pdf.set_font("Arial", size=12)
    pdf.ln(10)
    pdf.multi_cell(0, 10, """
SAFETY WARNINGS:
- Always disconnect power before servicing
- Use proper PPE including safety glasses
- Follow local electrical codes
- Minimum clearance requirements must be maintained

This manual covers installation procedures for Model XYZ-5000 HVAC units.
    """)
    
    # Page 2: Parts List
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Parts List", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.ln(5)
    pdf.multi_cell(0, 8, """
Main Components:
- Compressor Unit: Part #ABC-123
- Condenser Coil: Part #DEF-456
- Evaporator Assembly: Part #GHI-789
- Control Board: Part #JKL-012
- Refrigerant Lines: Part #MNO-345
- Electrical Disconnect: Part #PQR-678
- Mounting Brackets: Part #STU-901

Tools Required:
- Torque wrench (50-250 ft-lbs)
- Digital multimeter
- Refrigerant gauges
- Vacuum pump
- Pipe cutter and flaring tool
    """)
    
    # Page 3: Installation Diagram
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Installation Clearances", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.ln(5)
    pdf.multi_cell(0, 8, """
CRITICAL CLEARANCE REQUIREMENTS:

Outdoor Unit Clearances:
- Front (Service Access): 36 inches minimum
- Sides: 12 inches minimum
- Rear: 12 inches minimum
- Top: 60 inches minimum (no obstructions)

Indoor Unit Clearances:
- Front: 30 inches minimum
- Sides: 6 inches minimum
- Top: 12 inches minimum

[DIAGRAM: Installation clearance diagram would appear here]

Note: These clearances are required for proper airflow and service access.
Failure to maintain clearances will void warranty.
    """)
    
    # Page 4: Electrical Specifications
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Electrical Specifications", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.ln(5)
    pdf.multi_cell(0, 8, """
Electrical Requirements Table:

Model XYZ-5000:
- Voltage: 208-230V Single Phase
- Minimum Circuit Ampacity: 35 Amps
- Maximum Overcurrent Protection: 45 Amps
- Wire Size: #8 AWG Copper
- Disconnect Required: Yes
- Ground Wire: #10 AWG Copper

Power Consumption:
- Cooling Mode: 3.5 kW
- Heating Mode: 4.2 kW
- Fan Only: 0.5 kW

WARNING: All electrical work must be performed by licensed electrician.
    """)
    
    # Page 5: Troubleshooting
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "Troubleshooting Guide", ln=True)
    pdf.set_font("Arial", size=12)
    pdf.ln(5)
    pdf.multi_cell(0, 8, """
Common Error Codes:

E01 - High Pressure Fault
- Check for blocked condenser
- Verify fan operation
- Check refrigerant charge

E02 - Low Pressure Fault  
- Check for refrigerant leak
- Verify filter condition
- Check evaporator airflow

E03 - Compressor Overload
- Check voltage at unit
- Verify capacitor condition
- Allow unit to cool down

E04 - Temperature Sensor Fault
- Check sensor connections
- Replace faulty sensor
- Verify control board operation

E05 - Communication Error
- Check control wiring
- Verify 24V transformer
- Reset system power
    """)
    
    # Save PDF
    pdf.output(filename)
    print(f"✅ Created sample PDF: {filename}")
    return filename

async def test_system():
    """Test the complete construction documentation system"""
    print("🚀 Construction Documentation System Test")
    print("=" * 50)
    
    # Step 1: Create sample PDF
    print("\n1️⃣ Creating sample PDF...")
    pdf_file = create_sample_pdf()
    
    # Step 2: Process the PDF
    print("\n2️⃣ Processing PDF with construction_doc_processor...")
    from construction_doc_processor import ConstructionDocProcessor
    
    processor = ConstructionDocProcessor()
    result = await processor.process_pdf(pdf_file, system_hint="HVAC")
    
    print(f"\n✅ Processing complete!")
    print(f"   Document ID: {result['document_id']}")
    print(f"   Pages processed: {result['processed_pages']}")
    
    # Step 3: Test the API
    print("\n3️⃣ Testing search API...")
    print("   Note: Make sure to run the API server first:")
    print("   python src/construction_search_api.py")
    
    # Step 4: Test the interface
    print("\n4️⃣ Testing mobile interface...")
    print("   Open frontend/construction-search.html in your browser")
    
    print("\n📋 Sample searches to try:")
    print("   - Text: 'clearance requirements'")
    print("   - Text: 'error code E03'")
    print("   - Tags: Click 'Diagrams' or 'Troubleshooting'")
    print("   - System: Filter by 'HVAC'")
    
    print("\n✨ Demo complete! The system is ready to use.")

if __name__ == "__main__":
    asyncio.run(test_system())