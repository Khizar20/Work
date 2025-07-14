# Botpress Hotel Document Search Integration

## Overview
This integration allows your Botpress chatbot to search through hotel-specific documents using AI embeddings to provide intelligent, contextual responses.

## Setup Steps

### 1. Run the Database Setup
Execute the SQL in `setup-document-search.sql` in your Supabase SQL Editor.

### 2. Test the Search API
```bash
# Test the search endpoint
curl -X POST http://localhost:3000/api/search-documents \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the hotel amenities?",
    "hotel_id": "8a1e6805-9253-4dd5-8893-0de3d7815555",
    "limit": 3
  }'
```

### 3. Botpress Integration

#### A. Create Custom Action in Botpress

```typescript
// In your Botpress bot, create a custom action called "searchHotelDocuments"

import axios from 'axios';

interface SearchDocumentsProps {
  query: string;
  hotelId: string;
  limit?: number;
}

export const searchHotelDocuments = async (props: SearchDocumentsProps) => {
  const { query, hotelId, limit = 3 } = props;
  
  try {
    console.log(`🔍 Searching documents for: "${query}" in hotel: ${hotelId}`);
    
    const response = await axios.post('http://localhost:3000/api/search-documents', {
      query: query,
      hotel_id: hotelId,
      limit: limit
    });
    
    if (response.data.success && response.data.results.length > 0) {
      const relevantInfo = response.data.results
        .map((doc: any) => `${doc.title}: ${doc.content_excerpt}`)
        .join('\n\n');
      
      return {
        found: true,
        context: relevantInfo,
        documentCount: response.data.count,
        results: response.data.results
      };
    } else {
      return {
        found: false,
        context: 'No relevant information found in hotel documents.',
        documentCount: 0,
        results: []
      };
    }
  } catch (error) {
    console.error('❌ Document search failed:', error);
    return {
      found: false,
      context: 'Unable to search hotel documents at this time.',
      documentCount: 0,
      results: []
    };
  }
};
```

#### B. Update Your Bot Flow

```yaml
# In your Botpress conversation flow
on_message:
  - condition: "{{ event.preview.length > 0 }}"
    actions:
      # Extract hotel_id from session or URL parameters
      - name: set_hotel_id
        code: |
          workflow.hotelId = event.state.session.hotelId || "8a1e6805-9253-4dd5-8893-0de3d7815555";
      
      # Search relevant documents
      - name: search_documents
        action: searchHotelDocuments
        input:
          query: "{{ event.preview }}"
          hotelId: "{{ workflow.hotelId }}"
          limit: 3
        output: documentSearch
      
      # Generate response with context
      - name: generate_response
        action: generateText
        input:
          prompt: |
            You are a helpful hotel assistant. Use the following hotel information to answer the guest's question.
            
            Guest Question: {{ event.preview }}
            
            {% if documentSearch.found %}
            Relevant Hotel Information:
            {{ documentSearch.context }}
            
            Please provide a helpful response based on this information. Be specific and mention details from the hotel documents.
            {% else %}
            No specific hotel information was found for this question. Provide a general helpful response.
            {% endif %}
          
        output: response
      
      # Send the response
      - name: send_message
        action: say
        input:
          text: "{{ response.text }}"
```

#### C. Production URL Configuration

For production, update the API URL in your Botpress action:

```typescript
// Replace localhost with your actual domain
const response = await axios.post('https://your-admin-domain.com/api/search-documents', {
  query: query,
  hotel_id: hotelId,
  limit: limit
});
```

## Example Conversations

### Guest: "What amenities does the hotel have?"
**Bot searches documents → Finds hotel guide → Responds:**
"Based on our hotel information, Hotel Grand Paradise offers the following amenities: swimming pool, fitness center, spa services, complimentary WiFi, 24-hour room service, and concierge assistance..."

### Guest: "What time is checkout?"
**Bot searches documents → Finds operational guide → Responds:**
"According to our hotel policies, checkout time is 11:00 AM. If you need a late checkout, please contact the front desk and we'll do our best to accommodate based on availability..."

## Testing Your Integration

1. **Upload hotel documents** with relevant information
2. **Wait for embeddings** to be generated (check database)
3. **Test the search API** with sample queries
4. **Configure Botpress** with the custom action
5. **Test conversations** with hotel-specific questions

## Performance Considerations

- **Search Speed**: ~1-3 seconds per query
- **Relevance Threshold**: 0.3 (adjust based on results quality)
- **Document Limit**: 3-5 results per query (prevents information overload)
- **Caching**: Consider caching frequent queries for better performance

## Monitoring

Monitor your logs for:
- 🔍 Document search requests
- ✅ Successful embedding generation
- ❌ Search errors or timeouts
- 📊 Query relevance scores

Your Botpress chatbot now has intelligent access to hotel-specific information! 