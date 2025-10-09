-- Add new fields to evidence table
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "uploadedBy" TEXT;
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "uploadedByName" TEXT;
ALTER TABLE "evidence" ADD COLUMN IF NOT EXISTS "uploadedByRole" TEXT;

-- Create investigation_notes table
CREATE TABLE IF NOT EXISTS "investigation_notes" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdByName" TEXT NOT NULL,
    "createdByRole" TEXT NOT NULL,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigation_notes_pkey" PRIMARY KEY ("id")
);

-- Add foreign key for investigation_notes
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'investigation_notes_itemId_fkey'
    ) THEN
        ALTER TABLE "investigation_notes" 
        ADD CONSTRAINT "investigation_notes_itemId_fkey" 
        FOREIGN KEY ("itemId") REFERENCES "stolen_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

