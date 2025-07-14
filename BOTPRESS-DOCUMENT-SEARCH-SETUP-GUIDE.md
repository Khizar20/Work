# 🔍 Botpress Hotel Document Search Implementation Guide

## Overview

This guide helps you implement AI-powered document search in your Botpress hotel assistant that:
- ✅ Searches hotel-specific documents using embeddings
- ✅ Provides contextual answers based on uploaded PDFs
- ✅ Maintains hotel data isolation
- ✅ Falls back gracefully when no documents are found

## 🚀 Quick Start (Recommended)

### Option 1: Use Existing API Endpoint (Simplest)

If you already have a working `/api/search-documents` endpoint, use this approach:

#### Step 1: Create Execute Code Node in Botpress
1. **Go to Botpress Studio** → **Flows** → **Create New Flow**: `Document Search`
2. **Add Execute Code Node**
3. **Copy the code from**: `botpress-hotel-document-search-simple.js`

#### Step 2: Update API URL
```javascript
// Change this line in the code:
const response = await axios.post('http://localhost:3000/api/search-documents', {
// To your production URL:
const response = await axios.post('https://your-admin-dashboard.vercel.app/api/search-documents', {
```

#### Step 3: Create Response Node
Add a **Say Node** after the Execute Code with:
```
{{workflow.searchResult.response}}
```

#### Step 4: Add Flow Triggers
Set triggers for:
- "hotel information"
- "amenities"
- "policies"
- "services"
- Or make it the default flow

---

## 🔧 Advanced Setup (Vector Search)

### Option 2: Direct Vector Search (More Control)

For advanced features and better performance:

#### Step 1: Database Setup
1. **Run SQL Script**: Execute `setup-hotel-document-search.sql` in Supabase SQL Editor
2. **Verify Extensions**: Ensure `vector` extension is enabled
3. **Test Function**: Run a test query to verify the function works

#### Step 2: Get HuggingFace API Key
1. **Sign up** at [HuggingFace](https://huggingface.co/)
2. **Get API Key** from Settings → Access Tokens
3. **Update the code** with your API key:
```javascript
const HF_API_KEY = 'hf_your_actual_api_key_here';
```

#### Step 3: Create Execute Code Node
1. **Copy code from**: `botpress-hotel-document-search-flow.js`
2. **Update Supabase credentials** if needed
3. **Test the function** with sample queries

---

## 📋 Botpress Flow Setup

### Complete Flow Structure:

```
[User Message] 
    ↓
[Check if Query Length > 3] 
    ↓
[Execute Code: Document Search]
    ↓
[Condition: searchResult.found]
    ↓
[True] → [Say: {{workflow.searchResult.response}}]
    ↓
[False] → [Say: "Contact front desk for assistance"]
```

### Detailed Flow Setup:

#### 1. **Entry Point**
```
Trigger: User message contains text
Condition: {{event.preview.length > 3}}
```

#### 2. **Execute Code Node**
```javascript
// Use either simple or advanced version
// Code automatically handles hotel_id extraction
// Returns: workflow.searchResult object
```

#### 3. **Conditional Response**
```javascript
// Condition
{{workflow.searchResult.found}}

// True Path
{{workflow.searchResult.response}}

// False Path  
I couldn't find information about that. Let me connect you with our front desk for personalized assistance.
```

#### 4. **Quick Reply Options** (Optional)
```
- "Ask another question"
- "Contact front desk"
- "Show hotel amenities"
- "Room service menu"
```

---

## 🧪 Testing Your Implementation

### Test Queries:
```
"What time is breakfast served?"
"What's the WiFi password?"
"What amenities does the hotel have?"
"Are pets allowed?"
"What time is checkout?"
"Where is the nearest restaurant?"
"How do I request room service?"
```

### Expected Flow:
1. **User asks question** via chatbot
2. **Bot extracts hotel_id** from session data
3. **Searches hotel documents** using embeddings
4. **Returns contextual answer** from documents
5. **Logs analytics** for improvement

### Testing Commands:
```bash
# Test your API endpoint directly
curl -X POST http://localhost:3000/api/search-documents \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What time is breakfast?",
    "hotel_id": "8a1e6805-9253-4dd5-8893-0de3d7815555",
    "limit": 3
  }'

# Test with different hotels
curl -X POST http://localhost:3000/api/search-documents \
  -H "Content-Type: application/json" \
  -d '{
    "query": "swimming pool hours",
    "hotel_id": "your-other-hotel-id",
    "limit": 3
  }'
```

---

## 🔧 Configuration Options

### Embedding Model Options:
```javascript
// HuggingFace Models (Free)
'sentence-transformers/all-MiniLM-L6-v2'     // 384 dimensions, good balance
'sentence-transformers/all-mpnet-base-v2'    // 768 dimensions, more accurate
'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2' // Multilingual

// OpenAI Models (Paid)
'text-embedding-ada-002'  // 1536 dimensions, very accurate
```

### Search Parameters:
```javascript
// Adjust these in your code
similarity_threshold: 0.5,  // Minimum similarity (0.3-0.8)
match_count: 3,            // Number of results (1-5)
timeout: 10000            // API timeout in ms
```

### Response Customization:
```javascript
// High confidence response (similarity > 0.7)
"Based on our {hotel_name} documentation: {content}"

// Medium confidence response (similarity > 0.5)
"I found information about {query} in our {document_title}"

// Low confidence response
"Please contact our front desk for detailed information"
```

---

## 📊 Analytics & Monitoring

### Track Search Performance:
```sql
-- View search analytics
SELECT 
  hotel_id,
  query,
  results_found,
  result_count,
  created_at
FROM search_analytics 
WHERE hotel_id = 'your-hotel-id'
ORDER BY created_at DESC
LIMIT 50;

-- Popular queries
SELECT 
  query,
  COUNT(*) as search_count,
  AVG(CASE WHEN results_found THEN 1 ELSE 0 END) as success_rate
FROM search_analytics 
WHERE hotel_id = 'your-hotel-id'
GROUP BY query
ORDER BY search_count DESC
LIMIT 20;
```

### Monitor Bot Performance:
- Search success rate (should be > 70%)
- Average response time (should be < 3 seconds)
- Most common failed queries (add more documents)

---

## 🛠️ Troubleshooting

### Common Issues:

#### "Function search_hotel_documents does not exist"
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM pg_proc WHERE proname = 'search_hotel_documents';
-- If empty, re-run the SQL setup script
```

#### "No hotel_id found in session"
```javascript
// Debug in Botpress Execute Code
console.log('User state:', event.state.user);
console.log('Session state:', event.state.session);
// Verify QR code flow is working
```

#### "API timeout errors"
```javascript
// Increase timeout in axios call
timeout: 15000 // 15 seconds

// Add retry logic
for (let i = 0; i < 3; i++) {
  try {
    const response = await axios.post(/*...*/);
    break;
  } catch (error) {
    if (i === 2) throw error;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

#### "Vector similarity not working"
```sql
-- Check if embeddings exist
SELECT COUNT(*) FROM documents 
WHERE hotel_id = 'your-hotel-id' 
AND embedding IS NOT NULL;

-- Check embedding dimensions
SELECT pg_column_size(embedding) / 4 as dimensions 
FROM documents 
WHERE embedding IS NOT NULL 
LIMIT 1;
```

---

## 🚀 Production Deployment

### Environment Variables:
```bash
# Add to your environment
HUGGINGFACE_API_KEY=hf_your_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### Performance Optimization:
1. **Index Creation**: Ensure proper indexes on embeddings
2. **Caching**: Cache frequent queries
3. **Batch Processing**: Process multiple documents efficiently
4. **CDN**: Use CDN for document delivery

### Security Considerations:
1. **Rate Limiting**: Prevent API abuse
2. **Hotel Isolation**: Ensure proper data separation
3. **Input Validation**: Sanitize user queries
4. **Error Handling**: Don't expose internal errors

---

## 📈 Success Metrics

### Key Performance Indicators:
- **Search Success Rate**: > 70% of queries find relevant documents
- **Response Time**: < 3 seconds for document search
- **User Satisfaction**: Track through follow-up questions
- **Coverage**: % of hotel services covered by documents

### Improvement Strategies:
1. **Analyze Failed Queries**: Add missing documents
2. **Optimize Embeddings**: Use better models or fine-tuning
3. **Improve Documents**: Better structure and content
4. **User Feedback**: Collect and act on user feedback

---

## 🎯 Next Steps

1. **Start with Simple Version**: Use existing API endpoint
2. **Test Thoroughly**: Verify with multiple hotels and queries
3. **Collect Analytics**: Monitor performance and user satisfaction
4. **Iterate and Improve**: Add more documents and optimize responses
5. **Scale**: Deploy to production with monitoring

This implementation will significantly enhance your hotel chatbot's ability to provide accurate, hotel-specific information to guests! 