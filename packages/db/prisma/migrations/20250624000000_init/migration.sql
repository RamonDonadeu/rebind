-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('free', 'collector');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('none', 'active', 'past_due', 'canceled');

-- CreateEnum
CREATE TYPE "BinderLayout" AS ENUM ('GRID_3X3', 'GRID_3X4');

-- CreateEnum
CREATE TYPE "CardVariant" AS ENUM ('normal', 'reverse', 'holo');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "plan_tier" "PlanTier" NOT NULL DEFAULT 'free',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'none',
    "stripe_customer_id" TEXT,
    "subscription_ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "binders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "page_count" INTEGER NOT NULL DEFAULT 24,
    "layout" "BinderLayout" NOT NULL DEFAULT 'GRID_3X3',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "binders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "binder_slots" (
    "id" TEXT NOT NULL,
    "binder_id" TEXT NOT NULL,
    "page_index" INTEGER NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "card_external_id" TEXT,
    "card_name" TEXT,
    "image_url" TEXT,
    "variant" "CardVariant" NOT NULL DEFAULT 'normal',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "binder_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_prices" (
    "card_external_id" TEXT NOT NULL,
    "variant" "CardVariant" NOT NULL,
    "source" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "market_price" DECIMAL(12,4),
    "low_price" DECIMAL(12,4),
    "fetched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_prices_pkey" PRIMARY KEY ("card_external_id","variant","source")
);

-- CreateTable
CREATE TABLE "binder_valuations" (
    "binder_id" TEXT NOT NULL,
    "total_usd" DECIMAL(14,2),
    "total_eur" DECIMAL(14,2),
    "card_count" INTEGER NOT NULL DEFAULT 0,
    "priced_count" INTEGER NOT NULL DEFAULT 0,
    "missing_price_count" INTEGER NOT NULL DEFAULT 0,
    "computed_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "binder_valuations_pkey" PRIMARY KEY ("binder_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "binders_user_id_idx" ON "binders"("user_id");

-- CreateIndex
CREATE INDEX "binder_slots_binder_id_idx" ON "binder_slots"("binder_id");

-- CreateIndex
CREATE INDEX "binder_slots_card_external_id_idx" ON "binder_slots"("card_external_id");

-- CreateIndex
CREATE UNIQUE INDEX "binder_slots_binder_id_page_index_row_col_key" ON "binder_slots"("binder_id", "page_index", "row", "col");

-- AddForeignKey
ALTER TABLE "binders" ADD CONSTRAINT "binders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "binder_slots" ADD CONSTRAINT "binder_slots_binder_id_fkey" FOREIGN KEY ("binder_id") REFERENCES "binders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "binder_valuations" ADD CONSTRAINT "binder_valuations_binder_id_fkey" FOREIGN KEY ("binder_id") REFERENCES "binders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
