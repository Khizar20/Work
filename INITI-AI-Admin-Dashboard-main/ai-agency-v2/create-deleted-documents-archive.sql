-- Create deleted documents archive table
-- This will store deleted documents for recovery purposes

CREATE TABLE IF NOT EXISTS public.deleted_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Original document data
    original_document_id uuid NOT NULL,
    hotel_id uuid NOT NULL,
    uploaded_by uuid NOT NULL,
    title text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    description text,
    processed boolean NOT NULL DEFAULT false,
    original_created_at timestamp with time zone NOT NULL,
    original_updated_at timestamp with time zone NOT NULL,
    metadata jsonb,
    vector_id text,
    -- Deletion metadata
    deleted_at timestamp with time zone NOT NULL DEFAULT now(),
    deleted_by uuid NOT NULL,
    deletion_reason text,
    -- File storage info (in case we need to recover from backup)
    storage_path text,
    file_size bigint,
    -- Foreign key constraints
    CONSTRAINT deleted_documents_hotel_id_fkey FOREIGN KEY (hotel_id) REFERENCES public.hotels(id),
    CONSTRAINT deleted_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.hotel_admins(id),
    CONSTRAINT deleted_documents_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.hotel_admins(id)
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_deleted_documents_hotel_id ON public.deleted_documents(hotel_id);
CREATE INDEX IF NOT EXISTS idx_deleted_documents_uploaded_by ON public.deleted_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_deleted_documents_deleted_at ON public.deleted_documents(deleted_at);
CREATE INDEX IF NOT EXISTS idx_deleted_documents_original_id ON public.deleted_documents(original_document_id);

-- Enable RLS on deleted_documents table
ALTER TABLE public.deleted_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for deleted_documents
CREATE POLICY "Hotel admins can view their hotel's deleted documents" ON public.deleted_documents
FOR SELECT 
USING (
    hotel_id IN (
        SELECT ha.hotel_id 
        FROM public.hotel_admins ha 
        WHERE ha.user_id = auth.uid()
    )
);

CREATE POLICY "Hotel admins can insert deleted documents" ON public.deleted_documents
FOR INSERT 
WITH CHECK (
    deleted_by IN (
        SELECT ha.id 
        FROM public.hotel_admins ha 
        WHERE ha.user_id = auth.uid()
    )
    AND 
    hotel_id IN (
        SELECT ha.hotel_id 
        FROM public.hotel_admins ha 
        WHERE ha.user_id = auth.uid()
    )
);

-- Comment on table
COMMENT ON TABLE public.deleted_documents IS 'Archive table for deleted documents to allow recovery if needed';
