import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding local SQLite database with demo catalog...");

  // 1. Admin User
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@stocksense.local" },
    update: {},
    create: {
      name: "Warehouse Administrator",
      email: "admin@stocksense.local",
      phone: "+919000000001",
      passwordHash,
      role: "ADMIN",
    },
  });

  // 2. Warehouses
  const mainWh = await prisma.warehouse.upsert({
    where: { code: "HYD-01" },
    update: {},
    create: { name: "Hyderabad Main Warehouse", code: "HYD-01", address: "Hyderabad, Telangana" },
  });

  const virtWh = await prisma.warehouse.upsert({
    where: { code: "VIRT-01" },
    update: {},
    create: { name: "Virtual Operations Warehouse", code: "VIRT-01", address: "System Virtual" },
  });

  // 3. Locations
  const locMain = await prisma.location.upsert({
    where: { barcode: "LOC-HYD-MAIN" },
    update: {},
    create: { warehouseId: mainWh.id, name: "Main Store", barcode: "LOC-HYD-MAIN", locationType: "internal" },
  });

  const locRackA = await prisma.location.upsert({
    where: { barcode: "LOC-HYD-RACK-A" },
    update: {},
    create: { warehouseId: mainWh.id, name: "Rack A", barcode: "LOC-HYD-RACK-A", locationType: "internal" },
  });

  const locVendor = await prisma.location.upsert({
    where: { barcode: "LOC-VENDOR" },
    update: {},
    create: { warehouseId: virtWh.id, name: "Virtual Vendor Source", barcode: "LOC-VENDOR", locationType: "vendor" },
  });

  const locCustomer = await prisma.location.upsert({
    where: { barcode: "LOC-CUSTOMER" },
    update: {},
    create: { warehouseId: virtWh.id, name: "Virtual Customer Dest", barcode: "LOC-CUSTOMER", locationType: "customer" },
  });

  const locLoss = await prisma.location.upsert({
    where: { barcode: "LOC-LOSS" },
    update: {},
    create: { warehouseId: virtWh.id, name: "Virtual Loss", barcode: "LOC-LOSS", locationType: "loss" },
  });

  // 4. Products Catalog
  const products = [
    { name: "Wireless Mouse", sku: "ELEC-MOUSE-001", barcode: "890000000001", uom: "pcs", min: 20, max: 100, qty: 50 },
    { name: "Mechanical Keyboard", sku: "ELEC-KEY-001", barcode: "890000000002", uom: "pcs", min: 10, max: 50, qty: 25 },
    { name: "USB-C Cable", sku: "ELEC-CABLE-001", barcode: "890000000003", uom: "pcs", min: 25, max: 150, qty: 75 },
    { name: "27-inch Monitor", sku: "ELEC-MON-001", barcode: "890000000004", uom: "pcs", min: 5, max: 25, qty: 10 },
    { name: "Safety Helmet", sku: "SAFE-HELMET-001", barcode: "890000000008", uom: "pcs", min: 15, max: 100, qty: 40 },
    { name: "Safety Gloves", sku: "SAFE-GLOVE-001", barcode: "890000000009", uom: "pair", min: 20, max: 150, qty: 60 },
  ];

  for (const item of products) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        unitOfMeasure: item.uom,
        reorderMin: item.min,
        reorderMax: item.max,
        reorderQty: item.qty,
      },
    });
  }

  // 5. Initial Demo Receipt Operation (60 Wireless Mice)
  const mouse = await prisma.product.findUnique({ where: { sku: "ELEC-MOUSE-001" } });
  if (mouse) {
    const existingOp = await prisma.stockOperation.findUnique({ where: { referenceCode: "REC-2026-001" } });
    if (!existingOp) {
      await prisma.stockOperation.create({
        data: {
          referenceCode: "REC-2026-001",
          operationType: "receipt",
          status: "done",
          sourceLocationId: locVendor.id,
          destinationLocationId: locMain.id,
          scheduledDate: new Date(),
          completedDate: new Date(),
          moves: {
            create: {
              productId: mouse.id,
              quantity: 60,
              unitOfMeasure: "pcs",
              sourceLocationId: locVendor.id,
              destinationLocationId: locMain.id,
              status: "done",
            },
          },
        },
      });
    }

    // Demo Alert
    await prisma.alert.create({
      data: {
        type: "low_stock",
        productId: mouse.id,
        warehouseId: mainWh.id,
        message: "Wireless Mouse stock level is approaching reorder threshold.",
        priority: "medium",
      },
    });
  }

  console.log("✅ Local SQLite database successfully seeded.");
}

main()
  .catch((e) => console.error("❌ Seeding failed:", e))
  .finally(() => prisma.$disconnect());
