/*
  Warnings:

  - You are about to drop the column `productId` on the `Order` table.
  - You are about to drop the column `quantity` on the `Order` table.
  - You are about to drop the column `reservationId` on the `Order` table.
  - You are about to drop the column `reservationId` on the `Payment` table.
*/

-- 1. Add new nullable columns
ALTER TABLE "Payment"
ADD COLUMN "orderId" TEXT;

ALTER TABLE "Reservation"
ADD COLUMN "orderId" TEXT;

-- 2. Copy existing relationships

-- Every reservation should now point to its order
UPDATE "Reservation" r
SET "orderId" = o.id
FROM "Order" o
WHERE o."reservationId" = r.id;

-- Every payment should now point to its order
UPDATE "Payment" p
SET "orderId" = o.id
FROM "Order" o
WHERE p."reservationId" = o."reservationId";

-- 3. Create the unique index AFTER the data has been copied
CREATE UNIQUE INDEX "Payment_orderId_key"
ON "Payment"("orderId");

-- 4. Remove obsolete indexes
DROP INDEX "Order_reservationId_key";
DROP INDEX "Payment_reservationId_key";

-- 5. Remove obsolete columns
ALTER TABLE "Order"
DROP COLUMN "productId",
DROP COLUMN "quantity",
DROP COLUMN "reservationId";

ALTER TABLE "Payment"
DROP COLUMN "reservationId";