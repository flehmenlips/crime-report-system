-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'citizen',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stolen_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serialNumber" TEXT,
    "purchaseDate" TEXT NOT NULL,
    "purchaseCost" DOUBLE PRECISION NOT NULL,
    "dateLastSeen" TEXT NOT NULL,
    "locationLastSeen" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "stolen_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."evidence" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "cloudinaryId" TEXT NOT NULL,
    "originalName" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" INTEGER NOT NULL,

    CONSTRAINT "evidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- AddForeignKey
ALTER TABLE "public"."stolen_items" ADD CONSTRAINT "stolen_items_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."evidence" ADD CONSTRAINT "evidence_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."stolen_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
