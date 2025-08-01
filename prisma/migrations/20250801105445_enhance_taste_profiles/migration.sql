-- AlterTable
ALTER TABLE "public"."Plan" ADD COLUMN     "culturalContext" JSONB,
ADD COLUMN     "locationData" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "public"."PreferenceItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "tasteProfileId" INTEGER NOT NULL,
    "preferenceType" TEXT NOT NULL,

    CONSTRAINT "PreferenceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocationPreference" (
    "id" SERIAL NOT NULL,
    "tasteProfileId" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "visitCount" INTEGER NOT NULL DEFAULT 1,
    "lastVisited" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "LocationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CulturalInsight" (
    "id" SERIAL NOT NULL,
    "tasteProfileId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CulturalInsight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PreferenceItem" ADD CONSTRAINT "PreferenceItem_musicProfile_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferenceItem" ADD CONSTRAINT "PreferenceItem_foodProfile_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferenceItem" ADD CONSTRAINT "PreferenceItem_aestheticProfile_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PreferenceItem" ADD CONSTRAINT "PreferenceItem_activityProfile_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationPreference" ADD CONSTRAINT "LocationPreference_tasteProfileId_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CulturalInsight" ADD CONSTRAINT "CulturalInsight_tasteProfileId_fkey" FOREIGN KEY ("tasteProfileId") REFERENCES "public"."TasteProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
