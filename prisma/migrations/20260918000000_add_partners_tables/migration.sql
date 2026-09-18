-- CreateTable
CREATE TABLE "PartnersSectionSettings" (
    "id" TEXT NOT NULL DEFAULT 'active',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT NOT NULL DEFAULT 'Trusted Brands & Technology Partners',
    "subtitle" TEXT,
    "colorMode" TEXT NOT NULL DEFAULT 'grayscale-hover-color',
    "layout" TEXT NOT NULL DEFAULT 'grid',
    "backgroundStyle" TEXT NOT NULL DEFAULT 'light',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnersSectionSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerLogo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "colorMode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerLogo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerLogo_active_idx" ON "PartnerLogo"("active");

-- CreateIndex
CREATE INDEX "PartnerLogo_order_idx" ON "PartnerLogo"("order");
