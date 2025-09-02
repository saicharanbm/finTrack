-- AlterTable
ALTER TABLE "public"."Transaction" ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE DATE;
