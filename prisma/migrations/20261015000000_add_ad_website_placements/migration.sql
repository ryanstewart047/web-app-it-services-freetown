-- AlterTable
ALTER TABLE "CustomAd" ADD COLUMN IF NOT EXISTS "disabledWebsites" TEXT DEFAULT '[]';

-- CreateTable
CREATE TABLE IF NOT EXISTS "AdWebsitePlacement" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "adId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdWebsitePlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdWebsitePlacement_domain_idx" ON "AdWebsitePlacement"("domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AdWebsitePlacement_adId_idx" ON "AdWebsitePlacement"("adId");
