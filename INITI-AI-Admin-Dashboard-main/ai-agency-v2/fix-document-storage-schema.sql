-- Add file_path column to documents table for proper file storage tracking
-- This will enable proper signed URL generation for private bucket files

-- Add file_path column
ALTER TABLE documents 
ADD COLUMN file_path TEXT;

-- Update existing records to extract file paths from existing successful uploads
-- First, let's check what we have in storage vs database
UPDATE documents 
SET file_path = 'hotel-' || hotel_id || '/' || 
    CASE 
        WHEN title = 'tester' THEN 'aeda4b40-7416-4a06-88bc-f0d802c4b098.pdf'
        ELSE NULL
    END
WHERE title = 'tester' AND file_path IS NULL;

-- For other documents, we'll need to determine their actual paths
-- based on the actual files in storage or re-upload them

COMMENT ON COLUMN documents.file_path IS 'Storage path for generating signed URLs from private bucket';

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);

-- Show the current state
SELECT id, title, file_url, file_path, file_type FROM documents;
