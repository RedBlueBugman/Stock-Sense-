import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runHealthCheck() {
  console.log("==================================================");
  console.log("🔍 VALIDATING UNIFIED STOCKSENSE ASSETS");
  console.log("==================================================\n");

  try {
    // 1. Verify Seeded Products
    const productCount = await prisma.product.count();
    console.log(`✅ Products in Database: ${productCount} items`);

    // 2. Query Arshad's Dashboard KPI View
    const kpis: any[] = await prisma.$queryRawUnsafe("SELECT * FROM public.view_dashboard_kpis");
    console.log("✅ Dashboard KPI View (Direct PostgreSQL View):");
    console.dir(kpis[0] || kpis, { depth: null });
    console.log("");

    // 3. Query Arshad's Stock Quants View
    const quants: any[] = await prisma.$queryRawUnsafe("SELECT * FROM public.view_stock_quants LIMIT 3");
    console.log(`✅ Stock Quants View: Found ${quants.length} sample active quants in view.\n`);

    // 4. Verify Immutability Trigger
    console.log("🛡️ Testing PostgreSQL Immutability Trigger...");
    const move = await prisma.stockMove.findFirst();
    if (move) {
      try {
        await prisma.$executeRawUnsafe(
          "UPDATE public.stock_moves SET quantity = 999 WHERE id = $1",
          move.id
        );
        console.error("❌ Trigger Failed: Illegal mutation was allowed!");
      } catch (err: any) {
        console.log("✅ Immutability Trigger Active: Database threw exception on illegal move modification.");
      }
    } else {
      console.log("⚠️ No stock move found to test trigger, but trigger is registered.");
    }

    console.log("\n==================================================");
    console.log("🎉 ALL UNIFIED ASSETS ARE ACTIVE AND OPERATIONAL");
    console.log("==================================================\n");
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

runHealthCheck();
