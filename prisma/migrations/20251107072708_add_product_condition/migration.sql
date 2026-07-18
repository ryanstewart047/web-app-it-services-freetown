-- AlterTable
ALTER TABLE "Product" ADD COLUMN "condition" TEXT NOT NULL DEFAULT 'new';

-- Add comment for documentation
COMMENT ON COLUMN "Product"."condition" IS 'Product condition: new, used, used-like-new, refurbished';
