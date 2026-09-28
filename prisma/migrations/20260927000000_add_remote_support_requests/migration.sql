CREATE TABLE "RemoteSupportRequest" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceModel" TEXT,
    "service" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "preferredTime" TEXT,
    "paymentMethod" TEXT,
    "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'new',
    "technicianNotes" TEXT,
    "sessionReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RemoteSupportRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RemoteSupportRequest_status_idx" ON "RemoteSupportRequest"("status");
CREATE INDEX "RemoteSupportRequest_createdAt_idx" ON "RemoteSupportRequest"("createdAt");
