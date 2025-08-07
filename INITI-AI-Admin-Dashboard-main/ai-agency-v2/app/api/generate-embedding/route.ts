import { NextResponse } from 'next/server';
import { pipeline } from '@xenova/transformers';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🧠 Generating embedding for text:', text.substring(0, 100) + '...');

    // Generate embedding using the same model as your main search
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    const embeddingTensor = await extractor(text, { pooling: 'mean', normalize: true });
    const embedding = Array.from(embeddingTensor.data as Float32Array);

    console.log('✅ Embedding generated, dimensions:', embedding.length);
    console.log('🔢 First 5 values:', embedding.slice(0, 5));

    return NextResponse.json({
      success: true,
      embedding: embedding,
      dimensions: embedding.length,
      model: 'Xenova/all-MiniLM-L6-v2',
      text_length: text.length
    });

  } catch (error) {
    console.error('❌ Embedding generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate embedding', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 