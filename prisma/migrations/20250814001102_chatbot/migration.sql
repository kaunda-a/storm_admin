/*
  Warnings:

  - The values [VISA_CHECKOUT] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'DRAFT', 'FAILED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_ORDER', 'NEW_MESSAGE', 'SYSTEM_ALERT', 'USER_MENTION', 'PROJECT_UPDATE');

-- CreateEnum
CREATE TYPE "ChatbotStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TRAINING', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChatMessageSender" AS ENUM ('USER', 'BOT', 'AGENT');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'HEART', 'ROCKET', 'THUMBS_UP', 'THUMBS_DOWN', 'LAUGH', 'HOORAY', 'CONFUSED', 'EYES');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'EFT', 'PAYPAL', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH_ON_DELIVERY', 'PAYFAST', 'PAYGATE', 'PEACH_PAYMENTS', 'OZOW', 'SNAPSCAN', 'ZAPPER', 'MASTERPASS', 'MOBICRED', 'PAYFLEX', 'LAYUP', 'CAPITEC_PAY', 'FNB_PAY', 'NEDBANK_PAY', 'STANDARD_BANK_PAY', 'ABSA_PAY', 'DISCOVERY_PAY', 'YOCO', 'PAYSTACK_ZA', 'FLUTTERWAVE_ZA');
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ChatbotStatus" NOT NULL DEFAULT 'INACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,

    CONSTRAINT "chatbots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_conversations" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "customerId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "chatbot_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "ChatMessageSender" NOT NULL DEFAULT 'BOT',
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_boards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_boards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kanban_cards" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "listId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "assigneeId" TEXT,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kanban_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" JSONB,
    "excerpt" TEXT,
    "coverImageUrl" TEXT,
    "authorId" TEXT NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "scheduledFor" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_images" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_categories" (
    "postId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "post_categories_pkey" PRIMARY KEY ("postId","categoryId")
);

-- CreateTable
CREATE TABLE "blog_tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "post_comments" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reactions" (
    "id" TEXT NOT NULL,
    "type" "ReactionType" NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_name_key" ON "blog_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_postId_userId_type_key" ON "post_reactions"("postId", "userId", "type");

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbots" ADD CONSTRAINT "chatbots_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "chatbots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_conversations" ADD CONSTRAINT "chatbot_conversations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "chatbot_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_boards" ADD CONSTRAINT "kanban_boards_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_lists" ADD CONSTRAINT "kanban_lists_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "kanban_boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_listId_fkey" FOREIGN KEY ("listId") REFERENCES "kanban_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kanban_cards" ADD CONSTRAINT "kanban_cards_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_images" ADD CONSTRAINT "post_images_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_categories" ADD CONSTRAINT "post_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "post_comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
