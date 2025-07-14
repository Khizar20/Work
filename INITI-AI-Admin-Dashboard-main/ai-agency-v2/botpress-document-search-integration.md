# 🤖 Botpress Hotel Document Search Integration Guide

## Overview
This guide shows how to integrate your working document search API with Botpress so the chatbot can provide intelligent answers based on your hotel's uploaded documents.

## 🎯 What You'll Achieve
- ✅ Chatbot searches hotel-specific documents using AI embeddings  
- ✅ Provides contextual answers from uploaded PDFs and documents
- ✅ Works with your existing multi-hotel QR code system
- ✅ Seamless integration with your current Botpress setup

## 🔧 Implementation Steps

### Step 1: Create Custom Action in Botpress Cloud

1. **Go to Botpress Cloud** → Your Bot → **Studio** → **Actions**
2. **Create New Action**: `searchHotelDocuments`
3. **Add this code:**

```typescript
// Action: searchHotelDocuments
// Description: Search hotel documents using AI embeddings

const searchHotelDocuments = async (input: any, { client, database }: any) => {
  const { query, hotel_id, limit = 3 } = input;
  
  try {
    // Your document search API endpoint
    const API_BASE_URL = 'https://your-admin-domain.com'; // Replace with your actual domain
    // For development: const API_BASE_URL = 'http://localhost:3000';
    
    console.log('🔍 Searching documents for hotel:', hotel_id, 'query:', query);
    
    const response = await fetch(`${API_BASE_URL}/api/search-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        hotel_id: hotel_id,
        limit: limit,
        match_threshold: 0.15 // Adjust for search sensitivity
      })
    });
    
    if (!response.ok) {
      console.error('Search API error:', response.status);
      return {
        found: false,
        error: `Search failed: ${response.status}`,
        results: []
      };
    }
    
    const data = await response.json();
    
    if (data.success && data.results && data.results.length > 0) {
      // Format results for the chatbot
      const formattedResults = data.results.map((doc: any) => ({
        title: doc.title,
        content: doc.content_excerpt,
        similarity: doc.similarity,
        type: doc.file_type
      }));
      
      // Create context string for AI response
      const context = formattedResults
        .map((doc: any) => `**${doc.title}**:\n${doc.content}`)
        .join('\n\n');
      
      console.log('✅ Found', data.results.length, 'relevant documents');
      
      return {
        found: true,
        count: data.results.length,
        results: formattedResults,
        context: context,
        query: query
      };
    } else {
      console.log('📭 No relevant documents found');
      return {
        found: false,
        count: 0,
        results: [],
        context: '',
        query: query
      };
    }
    
  } catch (error) {
    console.error('❌ Document search error:', error);
    return {
      found: false,
      error: error.message,
      results: [],
      query: query
    };
  }
};

// Export the action
module.exports = { searchHotelDocuments };
```

### Step 2: Create AI Response Action

1. **Create Another Action**: `generateContextualResponse`
2. **Add this code:**

```typescript
// Action: generateContextualResponse
// Description: Generate AI response using document context

const generateContextualResponse = async (input: any, { client }: any) => {
  const { query, searchResults, hotel_name, room_number } = input;
  
  try {
    // Use Botpress's built-in AI or call OpenAI/similar service
    let systemPrompt = `You are a helpful AI assistant for ${hotel_name}. `;
    
    if (room_number) {
      systemPrompt += `You are assisting a guest in room ${room_number}. `;
    }
    
    let prompt = `Guest Question: "${query}"\n\n`;
    
    if (searchResults.found && searchResults.context) {
      prompt += `Based on the following hotel information, please provide a helpful and specific answer:\n\n${searchResults.context}\n\n`;
      prompt += `Please provide a conversational response that directly addresses the guest's question using the information above. `;
      prompt += `Be specific and mention relevant details from the hotel documents. `;
      prompt += `If the information doesn't fully answer the question, acknowledge what you found and suggest how they can get more help.`;
    } else {
      prompt += `I don't have specific information about this topic in our hotel documents. `;
      prompt += `Please provide a general helpful response and suggest they contact the front desk at the hotel for specific details.`;
    }
    
    // For this example, we'll use a simple response format
    // In practice, you'd integrate with your preferred AI service (OpenAI, etc.)
    
    let response = '';
    
    if (searchResults.found) {
      response = `Based on our hotel information:\n\n`;
      response += `${searchResults.context.substring(0, 500)}...\n\n`;
      response += `Is there anything specific about this you'd like me to explain further? 😊`;
    } else {
      response = `I don't have specific information about "${query}" in our current hotel documents. `;
      response += `For the most accurate and up-to-date information, I recommend contacting our front desk. `;
      response += `Is there anything else I can help you with? 🏨`;
    }
    
    return {
      text: response,
      hasContext: searchResults.found,
      sourceCount: searchResults.count || 0
    };
    
  } catch (error) {
    console.error('❌ Response generation error:', error);
    return {
      text: "I'm having trouble accessing our hotel information right now. Please contact the front desk for assistance.",
      hasContext: false,
      sourceCount: 0
    };
  }
};

module.exports = { generateContextualResponse };
```

### Step 3: Create Main Conversation Flow

1. **Go to Studio** → **Flows** → **Create New Flow**: `Document Search Flow`
2. **Set up the flow nodes:**

#### Start Node (Entry Point):
```
Trigger: User message contains text
Condition: {{event.preview.length > 3}}
```

#### Node 1: Extract Hotel Context
```typescript
// Code Node: Extract hotel context
workflow.hotel_id = event.state.user.hotel_id || "8a1e6805-9253-4dd5-8893-0de3d7815555";
workflow.hotel_name = event.state.user.hotel_name || "Your Hotel";
workflow.room_number = event.state.user.room_number || "";
workflow.user_query = event.preview;

console.log('🏨 Processing query for hotel:', workflow.hotel_id, 'room:', workflow.room_number);
```

#### Node 2: Search Documents
```typescript
// Action Node: Call searchHotelDocuments
Action: searchHotelDocuments
Input:
  query: "{{workflow.user_query}}"
  hotel_id: "{{workflow.hotel_id}}"
  limit: 3
Output Variable: documentSearch
```

#### Node 3: Generate Response
```typescript
// Action Node: Call generateContextualResponse  
Action: generateContextualResponse
Input:
  query: "{{workflow.user_query}}"
  searchResults: "{{documentSearch}}"
  hotel_name: "{{workflow.hotel_name}}"
  room_number: "{{workflow.room_number}}"
Output Variable: aiResponse
```

#### Node 4: Send Response
```typescript
// Say Node: Send the response
Text: "{{aiResponse.text}}"

// Optional: Add quick replies for follow-up
Quick Replies:
- "Tell me more"
- "Contact front desk"  
- "Other questions"
```

### Step 4: Configure Flow Triggers

**In Studio → Flows → Document Search Flow:**

1. **Set as Default Flow**: Make this your main conversation flow
2. **Add Intent Triggers**: 
   - "hotel information"
   - "room service"
   - "amenities"
   - "policies"
   - "services"

### Step 5: Update Your Environment

**For Development:**
- Update API_BASE_URL to `http://localhost:3000` in the action

**For Production:**
- Update API_BASE_URL to your admin dashboard domain
- Ensure your admin dashboard is publicly accessible (or use a proxy)

### Step 6: Test the Integration

#### Test Message Examples:
- "What amenities does the hotel have?"
- "Tell me about room service"
- "What are the hotel policies?"
- "How do I connect to WiFi?"

#### Expected Flow:
1. 🏨 Guest asks question via chatbot
2. 🔍 Bot searches your hotel documents using embeddings
3. 📄 Finds relevant information from uploaded PDFs
4. 🤖 AI generates contextual response
5. 💬 Guest receives specific, helpful answer

## 🔧 Advanced Configuration

### Custom API Endpoint (Optional)

If you want a dedicated endpoint for Botpress, create this in your admin dashboard:

```typescript
// File: app/api/botpress-search/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { pipeline } from '@xenova/transformers';

export async function POST(request: Request) {
  try {
    const { query, hotel_id, limit = 3 } = await request.json();
    
    if (!query || !hotel_id) {
      return NextResponse.json(
        { error: 'Query and hotel_id required' },
        { status: 400 }
      );
    }
    
    // Generate embedding
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingTensor = await extractor(query, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(embeddingTensor.data as Float32Array);
    
    // Search documents
    const supabase = await createClient();
    const { data: documents, error } = await supabase.rpc('search_documents', {
      query_embedding: queryEmbedding,
      target_hotel_id: hotel_id,
      match_threshold: 0.15,
      match_count: limit
    });
    
    if (error) {
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }
    
    // Format for Botpress
    const formattedResults = (documents || []).map(doc => ({
      title: doc.title,
      content: doc.content_excerpt || doc.description,
      similarity: doc.similarity,
      type: doc.file_type
    }));
    
    const context = formattedResults
      .map(doc => `**${doc.title}**: ${doc.content}`)
      .join('\n\n');
    
    return NextResponse.json({
      success: true,
      found: documents && documents.length > 0,
      count: documents?.length || 0,
      results: formattedResults,
      context: context,
      query: query
    });
    
  } catch (error) {
    console.error('Botpress search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Enhanced AI Responses

For better AI responses, integrate with OpenAI or similar:

```typescript
// In generateContextualResponse action
const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user', 
        content: prompt
      }
    ],
    max_tokens: 300,
    temperature: 0.7
  })
});
```

## 🧪 Testing Your Setup

### 1. Test Document Search API
```bash
curl -X POST http://localhost:3000/api/search-documents \
  -H "Content-Type: application/json" \
  -d '{
    "query": "hotel amenities",
    "hotel_id": "8a1e6805-9253-4dd5-8893-0de3d7815555",
    "limit": 3
  }'
```

### 2. Test Botpress Integration
1. Go to your chat page with hotel context:
   ```
   http://localhost:3000/chat?hotel_id=8a1e6805-9253-4dd5-8893-0de3d7815555&room_number=101&session_id=test
   ```

2. Ask test questions:
   - "What amenities does the hotel have?"
   - "Tell me about room service"
   - "What are the WiFi details?"

### 3. Verify Data Flow
Check Botpress logs to ensure:
- ✅ Hotel ID is extracted from session
- ✅ Document search API is called
- ✅ Results are returned and formatted
- ✅ AI generates contextual responses

## 🚀 Production Deployment

### Checklist:
- [ ] Update API URLs to production domains
- [ ] Configure CORS for your admin dashboard
- [ ] Test with real QR codes from Supabase
- [ ] Verify all hotel IDs work correctly
- [ ] Monitor Botpress action logs
- [ ] Test document search performance

### Security:
- Ensure your admin dashboard API is properly secured
- Consider API rate limiting for Botpress requests
- Monitor for abuse/excessive requests

## 🎉 Success Metrics

When working correctly, guests will experience:
- ✅ **Instant answers** from hotel documents
- ✅ **Accurate information** specific to their hotel
- ✅ **Context-aware responses** mentioning room/hotel details
- ✅ **Seamless experience** without knowing about the backend search

Your chatbot will now be powered by your actual hotel documents using AI embeddings! 🤖📄✨ 