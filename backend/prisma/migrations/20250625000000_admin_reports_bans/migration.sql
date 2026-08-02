-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bannedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "banReason" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Report" (
    "id" SERIAL NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reportedUserId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewerNote" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Report_status_createdAt_idx" ON "Report"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
CREATE INDEX IF NOT EXISTS "Report_reporterId_idx" ON "Report"("reporterId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
    FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey"
    FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
