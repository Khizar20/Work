// Create document chunks with embeddings for better semantic search
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const supabase = createClient(supabaseUrl, supabaseKey);

// Smart text chunking function
function smartChunkText(text, maxChunkSize = 500, overlap = 50) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  let chunkIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim() + '.';
    
    // If adding this sentence would exceed max size, save current chunk
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        index: chunkIndex++,
        content: currentChunk.trim(),
        type: 'paragraph'
      });
      
      // Start new chunk with overlap from previous chunk
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-overlap).join(' ');
      currentChunk = overlapWords + ' ' + sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      index: chunkIndex,
      content: currentChunk.trim(),
      type: 'paragraph'
    });
  }
  
  return chunks;
}

// Enhanced chunking with section detection
function enhancedChunkText(text, maxChunkSize = 500) {
  const chunks = [];
  let chunkIndex = 0;
  
  // Split by common section markers
  const sections = text.split(/(?=\n\s*[A-Z][^.]*:|\n\s*\d+\.\s|\n\s*[•-]\s)/);
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    if (trimmedSection.length === 0) continue;
    
    // If section is small enough, keep as one chunk
    if (trimmedSection.length <= maxChunkSize) {
      chunks.push({
        index: chunkIndex++,
        content: trimmedSection,
        type: 'section'
      });
    } else {
      // Break large sections into smaller chunks
      const subChunks = smartChunkText(trimmedSection, maxChunkSize);
      for (const subChunk of subChunks) {
        chunks.push({
          index: chunkIndex++,
          content: subChunk.content,
          type: 'subsection'
        });
      }
    }
  }
  
  return chunks;
}

async function createDocumentChunks() {
  console.log('🔄 Creating document chunks for better semantic search...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  try {
    // 1. Get documents with content
    console.log('1️⃣ Getting documents with content...');
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('hotel_id', hotelId)
      .not('content', 'is', null)
      .neq('content', '');
    
    if (docsError) {
      console.error('❌ Error getting documents:', docsError);
      return;
    }
    
    console.log(`📄 Found ${documents.length} documents with content`);
    
    // 2. Process each document
    for (const document of documents) {
      console.log(`\n📖 Processing document: ${document.title}`);
      console.log(`📊 Content length: ${document.content.length} characters`);
      
      // 3. Create chunks from content
      const chunks = enhancedChunkText(document.content, 400);
      console.log(`🔪 Created ${chunks.length} chunks`);
      
      // 4. Generate embeddings for each chunk
      console.log('🧠 Generating embeddings for chunks...');
      const { pipeline } = await import('@xenova/transformers');
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`   Processing chunk ${i + 1}/${chunks.length} (${chunk.content.length} chars)`);
        
        // Generate embedding for this chunk
        const embeddingTensor = await extractor(chunk.content, { pooling: 'mean', normalize: true });
        const embedding = Array.from(embeddingTensor.data);
        
        // Store chunk in database
        const { error: insertError } = await supabase
          .from('content_chunks')
          .insert({
            document_id: document.id,
            hotel_id: hotelId,
            chunk_index: chunk.index,
            content: chunk.content,
            embedding: embedding,
            chunk_type: chunk.type,
            metadata: {
              original_document_title: document.title,
              chunk_size: chunk.content.length,
              word_count: chunk.content.split(' ').length
            }
          });
        
        if (insertError) {
          console.error(`❌ Error inserting chunk ${i + 1}:`, insertError);
        } else {
          console.log(`✅ Stored chunk ${i + 1} with embedding`);
        }
      }
      
      console.log(`✅ Completed processing ${document.title}`);
    }
    
    // 5. Verify the chunks were created
    console.log('\n5️⃣ Verifying chunks were created...');
    const { data: chunkCount, error: countError } = await supabase
      .from('content_chunks')
      .select('id', { count: 'exact' })
      .eq('hotel_id', hotelId);
    
    if (countError) {
      console.error('❌ Error counting chunks:', countError);
    } else {
      console.log(`✅ Total chunks created: ${chunkCount.length}`);
    }
    
    // 6. Test the chunk search
    console.log('\n6️⃣ Testing chunk search with "local guide recommendations"...');
    const testQuery = "local guide recommendations";
    const testExtractor = await import('@xenova/transformers').then(m => m.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2'));
    const testEmbeddingTensor = await testExtractor(testQuery, { pooling: 'mean', normalize: true });
    const testEmbedding = Array.from(testEmbeddingTensor.data);
    
    const { data: testResults, error: testError } = await supabase.rpc('search_content_chunks', {
      query_embedding: testEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.1,
      match_count: 3
    });
    
    if (testError) {
      console.error('❌ Error testing chunk search:', testError);
    } else {
      console.log(`🔍 Test search found ${testResults.length} relevant chunks:`);
      testResults.forEach((result, i) => {
        console.log(`   ${i + 1}. Similarity: ${result.similarity.toFixed(3)}`);
        console.log(`      Content: ${result.chunk_content.substring(0, 100)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createDocumentChunks(); 