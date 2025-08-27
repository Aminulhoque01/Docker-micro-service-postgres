/*
  Warnings:

  - You are about to drop the column `useName` on the `Order` table. All the data in the column will be lost.
  - Added the required column `userName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "useName",
ADD COLUMN     "userName" TEXT NOT NULL;
