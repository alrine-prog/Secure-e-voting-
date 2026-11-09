CREATE TABLE IF NOT EXISTS "_ProfilePhotoMigrationMarker" ("id" INTEGER PRIMARY KEY);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
DROP TABLE IF EXISTS "_ProfilePhotoMigrationMarker";
