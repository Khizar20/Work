// Test SQL functions for chunk search
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fxxzotnhkahdrehvkwhb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eHpvdG5oa2FoZHJlaHZrd2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjI5NDIsImV4cCI6MjA2NDYzODk0Mn0.nv9yE8Z9_2b6MJbPxHduCSivwdBaZWsNSiJIdBv_3jE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSQLFunctions() {
  console.log('🧪 Testing SQL functions...\n');
  
  const hotelId = "8a1e6805-9253-4dd5-8893-0de3d7815555";
  
  try {
    // First, let's run the SQL fix
    console.log('🔧 Running SQL fix...');
    const sqlFix = `
-- Fix data type issues in chunk search functions
CREATE OR REPLACE FUNCTION search_documents_with_chunks(
  query_embedding vector(384),
  target_hotel_id text,
  match_threshold float DEFAULT 0.1,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id text,
  title text,
  content_excerpt text,
  file_type text,
  similarity float,
  chunk_content text,
  chunk_index int,
  chunk_type text,
  document_title text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.document_id::text as id,
    d.title::text as title,
    d.description::text as content_excerpt,
    d.file_type::text as file_type,
    (1 - (cc.embedding <=> query_embedding))::float as similarity,
    cc.content::text as chunk_content,
    cc.chunk_index::int as chunk_index,
    cc.chunk_type::text as chunk_type,
    d.title::text as document_title
  FROM content_chunks cc
  JOIN documents d ON cc.document_id = d.id
  WHERE cc.hotel_id = target_hotel_id::uuid
    AND (1 - (cc.embedding <=> query_embedding)) > match_threshold
  ORDER BY cc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
    `;
    
    const { data: fixResult, error: fixError } = await supabase.rpc('exec', { sql: sqlFix });
    
    if (fixError) {
      console.error('❌ SQL fix error:', fixError);
      return;
    }
    
    console.log('✅ SQL fix applied successfully\n');
    
    // Test the function with a dummy embedding
    console.log('🔍 Testing search_documents_with_chunks function...');
    
    // Create a dummy embedding (384 dimensions of zeros)
    const dummyEmbedding = new Array(384).fill(0);
    
    const { data: searchResult, error: searchError } = await supabase.rpc('search_documents_with_chunks', {
      query_embedding: dummyEmbedding,
      target_hotel_id: hotelId,
      match_threshold: 0.0,
      match_count: 3
    });
    
    if (searchError) {
      console.error('❌ Search function error:', searchError);
      return;
    }
    
    console.log('✅ Search function working!');
    console.log(`📊 Found ${searchResult.length} results`);
    
    if (searchResult.length > 0) {
      console.log('\n📄 Sample result:');
      const sample = searchResult[0];
      console.log(`- ID: ${sample.id}`);
      console.log(`- Title: ${sample.title}`);
      console.log(`- Chunk Content: ${sample.chunk_content?.substring(0, 100)}...`);
      console.log(`- Chunk Index: ${sample.chunk_index}`);
      console.log(`- Chunk Type: ${sample.chunk_type}`);
      console.log(`- Similarity: ${sample.similarity}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testSQLFunctions(); 