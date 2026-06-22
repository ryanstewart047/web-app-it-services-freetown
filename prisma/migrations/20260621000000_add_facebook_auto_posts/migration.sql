-- CreateTable
CREATE TABLE "FacebookAutoPostSettings" (
    "id" TEXT NOT NULL DEFAULT 'active',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "intervalHours" INTEGER NOT NULL DEFAULT 24,
    "messageTemplate" TEXT NOT NULL DEFAULT '{topic}

Need help with a phone, laptop, or computer in Freetown? Book a diagnostic with IT Services Freetown today.

{link}

{hashtags}',
    "linkUrl" TEXT,
    "topics" JSONB,
    "photoUrls" JSONB,
    "hashtags" JSONB,
    "lastPostAt" TIMESTAMP(3),
    "nextPostAfter" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FacebookAutoPostSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FacebookAutoPostLog" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "triggeredBy" TEXT NOT NULL DEFAULT 'cron',
    "topic" TEXT,
    "message" TEXT,
    "photoUrl" TEXT,
    "facebookPostId" TEXT,
    "facebookPhotoId" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FacebookAutoPostLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacebookAutoPostLog_status_idx" ON "FacebookAutoPostLog"("status");

-- CreateIndex
CREATE INDEX "FacebookAutoPostLog_createdAt_idx" ON "FacebookAutoPostLog"("createdAt");
