/*
  Warnings:

  - The values [HOUSING,HEALTH,OTHERS] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - The values [DEBIT,CREDIT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `note` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `title` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Category_new" AS ENUM ('FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING', 'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'TRAVEL', 'GROCERIES', 'RENT', 'SALARY', 'FREELANCE', 'INVESTMENT', 'GIFT', 'OTHER');
ALTER TABLE "public"."Transaction" ALTER COLUMN "category" TYPE "public"."Category_new" USING ("category"::text::"public"."Category_new");
ALTER TYPE "public"."Category" RENAME TO "Category_old";
ALTER TYPE "public"."Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."TransactionType_new" AS ENUM ('INCOME', 'EXPENSE');
ALTER TABLE "public"."Transaction" ALTER COLUMN "type" TYPE "public"."TransactionType_new" USING ("type"::text::"public"."TransactionType_new");
ALTER TYPE "public"."TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "public"."TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "public"."TransactionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "note",
ADD COLUMN     "title" TEXT NOT NULL;
