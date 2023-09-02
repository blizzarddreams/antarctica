-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "replyId" INTEGER;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
