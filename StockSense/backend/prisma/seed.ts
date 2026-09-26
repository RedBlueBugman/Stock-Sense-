import { PrismaClient, Role, LocationType, OperationType, OperationStatus, MoveStatus, PartnerType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting StockSense database seeding...");
  await prisma.stockMove.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.stockOperation.deleteMany();
  await prisma.productLot.deleteMany();
  await prisma.reorderRule.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.location.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating system users...");
  const adminPass = await bcrypt.hash("Admin@123", 10);
  const managerPass = await bcrypt.hash("Manager@123", 10);
  const workerPass = await bcrypt.hash("Worker@123", 10);

  const admin = await prisma.user.create({ data: { name: "System Admin", email: "admin@stocksense.local", passwordHash: adminPass, role: Role.ADMIN } });
  const manager = await prisma.user.create({ data: { name: "Inventory Manager", email: "manager@stocksense.local", passwordHash: managerPass, role: Role.INVENTORY_MANAGER } });
  const worker = await prisma.user.create({ data: { name: "Floor Worker", email: "worker@stocksense.local", passwordHash: workerPass, role: Role.WAREHOUSE_WORKER } });

  console.log("🏭 Creating warehouses and virtual/physical locations...");
  const mainWH = await prisma.warehouse.create({ data: { name: "Main Distribution Center", code: "WH-MAIN", address: "100 Logistics Blvd, Warehouse District" } });
  await prisma.user.updateMany({ data: { assignedWarehouseIds: [mainWH.id] } });

  const vendorLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Vendor Source", locationType: LocationType.vendor } });
  const customerLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Customer Dest", locationType: LocationType.customer } });
  const lossLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Inventory Loss", locationType: LocationType.loss } });
  const prodLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Production Floor", locationType: LocationType.production } });

  const receivingDock = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Receiving Dock", barcode: "LOC-WH1-RECV", locationType: LocationType.internal } });
  const rackA = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Storage Rack A", barcode: "LOC-WH1-RACK-A", locationType: LocationType.internal } });
  const rackB = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Storage Rack B", barcode: "LOC-WH1-RACK-B", locationType: LocationType.internal } });
  const shippingDock = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Shipping Dock", barcode: "LOC-WH1-SHIP", locationType: LocationType.internal } });

  console.log("🏭 Creating warehouses and virtual/physical locations...");
  const mainWH = await prisma.warehouse.create({ data: { name: "Main Distribution Center", code: "WH-MAIN", address: "100 Logistics Blvd, Warehouse District" } });
  await prisma.user.updateMany({ data: { assignedWarehouseIds: [mainWH.id] } });

  const vendorLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Vendor Source", locationType: LocationType.vendor } });
  const customerLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Customer Dest", locationType: LocationType.customer } });
  const lossLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Inventory Loss", locationType: LocationType.loss } });
  const prodLoc = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Virtual Production Floor", locationType: LocationType.production } });

  const receivingDock = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Receiving Dock", barcode: "LOC-WH1-RECV", locationType: LocationType.internal } });
  const rackA = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Storage Rack A", barcode: "LOC-WH1-RACK-A", locationType: LocationType.internal } });
  const rackB = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Storage Rack B", barcode: "LOC-WH1-RACK-B", locationType: LocationType.internal } });
  const shippingDock = await prisma.location.create({ data: { warehouseId: mainWH.id, name: "Shipping Dock", barcode: "LOC-WH1-SHIP", locationType: LocationType.internal } });

  console.log("📦 Creating categories, products, partners, and initial baseline moves...");
  const rawCat = await prisma.productCategory.create({ data: { name: "Raw Materials" } });
  const finishedCat = await prisma.productCategory.create({ data: { name: "Finished Goods" } });

  const steel = await prisma.product.create({ data: { name: "Steel Rods 10mm", sku: "RAW-STL-001", barcode: "8901001001", categoryId: rawCat.id, unitOfMeasure: "kg", reorderMin: 50, reorderMax: 500, reorderQty: 200 } });
  const chair = await prisma.product.create({ data: { name: "Ergonomic Office Chair", sku: "FG-CHR-001", barcode: "8901001002", categoryId: finishedCat.id, unitOfMeasure: "pcs", reorderMin: 10, reorderMax: 100, reorderQty: 50 } });

  const supplier = await prisma.partner.create({ data: { name: "Apex Steel Supplies Ltd", type: PartnerType.supplier, email: "sales@apexsteel.local", phone: "+1-800-555-0199" } });
  const customer = await prisma.partner.create({ data: { name: "Global Tech Offices Inc", type: PartnerType.customer, email: "procure@globaltech.local", phone: "+1-800-555-0244" } });

  const initialReceipt = await prisma.stockOperation.create({
    data: {
      referenceCode: "REC/" + new Date().getFullYear() + "/0001",
      operationType: OperationType.receipt,
      status: OperationStatus.done,
      sourceLocationId: vendorLoc.id,
      destinationLocationId: rackA.id,
      partnerId: supplier.id,
      createdById: admin.id,
      completedDate: new Date(),
      notes: "Initial baseline stock provisioning",
      moves: {
        create: [
          { productId: steel.id, quantity: 150, unitOfMeasure: "kg", sourceLocationId: vendorLoc.id, destinationLocationId: rackA.id, status: MoveStatus.done },
          { productId: chair.id, quantity: 45, unitOfMeasure: "pcs", sourceLocationId: vendorLoc.id, destinationLocationId: rackA.id, status: MoveStatus.done },
        ],
      },
    },
  });

  console.log("✅ Database seeding completed successfully!");
}

main().catch((e) => { console.error("❌ Seeding error:", e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
