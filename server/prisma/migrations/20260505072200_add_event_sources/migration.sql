-- AlterTable
ALTER TABLE "Event" ADD COLUMN "source" TEXT,
ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Event_source_externalId_key" ON "Event"("source", "externalId");
