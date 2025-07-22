// Configuration file for the frontend
const config = {
    // API endpoint - update this to match your FastAPI server
    API_URL: process.env.API_URL || 'http://localhost:8000',
    
    // Supabase configuration (if needed for direct access)
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    
    // Feature flags
    features: {
        enableDocumentUpload: true,
        enableRiskAnalysis: true,
        enableCompliance: true,
        enableChat: false  // Set to true when chat functionality is ready
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}