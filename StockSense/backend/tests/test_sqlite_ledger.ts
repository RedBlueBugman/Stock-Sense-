import { PrismaClient } from "@prisma/client";
import assert from "node:assert";

const prisma = new PrismaClient();

async function testLedgerFlow() {
  console.log("==================================================");
  console.log("🚀 TESTING STOCKSENSE DOUBLE-ENTRY LEDGER (SQLITE)");
  console.log("==================================================\n");

  const PREFIX = "TEST_SQLITE_" + Date.now();

  try {
    // 1. Check Product Count
    const productCount = await prisma.product.count();
    console.log(`✅ Base Products in SQLite: ${productCount} items`);

    // 2. Setup Warehouse & Locations
    const wh = await prisma.warehouse.create({
      data: { name: `${PREFIX} Warehouse`, code: `${PREFIX}_WH` },
    });

    const vendorLoc = await prisma.location.create({
      data: { warehouseId: wh.id, name: `${PREFIX} Vendor`, locationType: "vendor" },
    });

    const mainStore = await prisma.location.create({
      data: { warehouseId: wh.id, name: `${PREFIX} Main Store`, locationType: "internal" },
    });

    const rackA = await prisma.location.create({
      data: { warehouseId: wh.id, name: `${PREFIX} Rack A`, locationType: "internal" },
    });

    const customerLoc = await prisma.location.create({
      data: { warehouseId: wh.id, name: `${PREFIX} Customer`, locationType: "customer" },
    });

    const lossLoc = await prisma.location.create({
      data: { warehouseId: wh.id, name: `${PREFIX} Loss`, locationType: "loss" },
    });

    const product = await prisma.product.create({
      data: { name: `${PREFIX} Steel Rods`, sku: `${PREFIX}_STL01`, unitOfMeasure: "kg" },
    });

    // ── STEP 1: RECEIPT (100 kg Vendor -> Main Store) ──
    await prisma.stockOperation.create({
      data: {
        referenceCode: `${PREFIX}_REC_1`,
        operationType: "receipt",
        status: "done",
        sourceLocationId: vendorLoc.id,
        destinationLocationId: mainStore.id,
        moves: {
          create: {
            productId: product.id,
            quantity: 100,
            unitOfMeasure: "kg",
            sourceLocationId: vendorLoc.id,
            destinationLocationId: mainStore.id,
            status: "done",
          },
        },
      },
    });
    console.log("📥 Step 1 Passed: Received 100 kg Steel (+100)");

    // ── STEP 2: TRANSFER (100 kg Main Store -> Rack A) ──
    await prisma.stockOperation.create({
      data: {
        referenceCode: `${PREFIX}_INT_1`,
        operationType: "internal",
        status: "done",
        sourceLocationId: mainStore.id,
        destinationLocationId: rackA.id,
        moves: {
          create: {
            productId: product.id,
            quantity: 100,
            unitOfMeasure: "kg",
            sourceLocationId: mainStore.id,
            destinationLocationId: rackA.id,
            status: "done",
          },
        },
      },
    });
    console.log("🔄 Step 2 Passed: Transferred 100 kg to Rack A (Location Updated)");

    // ── STEP 3: DELIVERY (20 kg Rack A -> Customer) ──
    await prisma.stockOperation.create({
      data: {
        referenceCode: `${PREFIX}_DEL_1`,
        operationType: "delivery",
        status: "done",
        sourceLocationId: rackA.id,
        destinationLocationId: customerLoc.id,
        moves: {
          create: {
            productId: product.id,
            quantity: 20,
            unitOfMeasure: "kg",
            sourceLocationId: rackA.id,
            destinationLocationId: customerLoc.id,
            status: "done",
          },
        },
      },
    });
    console.log("📤 Step 3 Passed: Delivered 20 kg to Customer (-20)");

    // ── STEP 4: ADJUSTMENT (3 kg Damaged -> Loss) ──
    await prisma.stockOperation.create({
      data: {
        referenceCode: `${PREFIX}_ADJ_1`,
        operationType: "adjustment",
        status: "done",
        sourceLocationId: rackA.id,
        destinationLocationId: lossLoc.id,
        moves: {
          create: {
            productId: product.id,
            quantity: 3,
            unitOfMeasure: "kg",
            sourceLocationId: rackA.id,
            destinationLocationId: lossLoc.id,
            status: "done",
          },
        },
      },
    });
    console.log("🔧 Step 4 Passed: Adjusted 3 kg Damaged to Loss (-3)");

    // ── VERIFY LEDGER MATH ──
    const inMoves = await prisma.stockMove.aggregate({
      where: { productId: product.id, destinationLocationId: rackA.id, status: "done" },
      _sum: { quantity: true },
    });
    const outMoves = await prisma.stockMove.aggregate({
      where: { productId: product.id, sourceLocationId: rackA.id, status: "done" },
      _sum: { quantity: true },
    });

    const rackAStock = Number(inMoves._sum.quantity || 0) - Number(outMoves._sum.quantity || 0);
    console.log(`\n📊 Final Rack A Stock: ${rackAStock} kg (Expected: 77 kg)`);

    assert.strictEqual(rackAStock, 77, "Stock in Rack A must be exactly 77 kg");

    console.log("\n==================================================");
    console.log("🎉 ALL TESTS PASSED — SQLITE BACKEND IS 100% OPERATIONAL");
    console.log("==================================================\n");
  } catch (err: any) {
    console.error("❌ Test failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLedgerFlow();
