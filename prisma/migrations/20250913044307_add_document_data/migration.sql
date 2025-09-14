-- AlterTable
ALTER TABLE "public"."evidence" ADD COLUMN     "documentData" BYTEA,
ALTER COLUMN "cloudinaryId" DROP NOT NULL;
