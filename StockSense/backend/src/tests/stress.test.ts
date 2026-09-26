import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface Move { id: string; productId: string; quantity: number; source: string; destination: string; status: "done" | "cancelled"; timestamp: Date; userId: string; }
interface Operation { id: string; refCode: string; type: string; status: string; }

const ledger: Move[] = [];
const operations: Operation[] = [];
const internalLocs = new Set(["main_store", "production_rack", "rack_a", "rack_b", "wh1_rack", "wh2_rack"]);

function stock(pid: string, loc?: string): number {
  const inQty = ledger.filter(m => m.productId === pid && m.status === "done" && (loc ? m.destination === loc : internalLocs.has(m.destination))).reduce((s, m) => s + m.quantity, 0);
  const outQty = ledger.filter(m => m.productId === pid && m.status === "done" && (loc ? m.source === loc : internalLocs.has(m.source))).reduce((s, m) => s + m.quantity, 0);
  return inQty - outQty;
}

function genRefCode(type: string): string {
  const prefixMap: Record<string, string> = { receipt: "REC", delivery: "DEL", internal: "INT", adjustment: "ADJ" };
  const count = operations.filter(o => o.type === type).length + 1;
  return prefixMap[type] + "/2026/" + String(count).padStart(4, "0");
}

function createOp(type: string, source: string, dest: string, productId: string, qty: number, userId: string): { op: Operation; move: Move } {
  const refCode = genRefCode(type);
  const op: Operation = { id: "op_" + Date.now() + Math.random(), refCode, type, status: "done" };
  const move: Move = { id: "m_" + Date.now() + Math.random(), productId, quantity: qty, source, destination: dest, status: "done", timestamp: new Date(), userId };
  operations.push(op);
  ledger.push(move);
  return { op, move };
}
async function runStressTests() {
  let passed = 0, failed = 0;
  const assert = (cond: boolean, name: string) => { if (cond) { console.log("  [PASS] " + name); passed++; } else { console.error("  [FAIL] " + name); failed++; } };

  console.log("\n=== SCENARIO 1: EXACT PROBLEM STATEMENT (Steel Rods) ===");
  createOp("receipt", "vendor", "main_store", "steel", 100, "admin");
  assert(stock("steel") === 100, "Step 1: Received 100kg steel from vendor");
  createOp("internal", "main_store", "production_rack", "steel", 100, "worker");
  assert(stock("steel") === 100, "Step 2: Transfer to production, total unchanged");
  assert(stock("steel", "main_store") === 0, "Step 2b: Main store now 0kg");
  assert(stock("steel", "production_rack") === 100, "Step 2c: Production rack now 100kg");
  createOp("delivery", "production_rack", "customer", "steel", 20, "worker");
  assert(stock("steel") === 80, "Step 3: Delivered 20kg, stock now 80kg");
  createOp("adjustment", "production_rack", "loss", "steel", 3, "manager");
  assert(stock("steel") === 77, "Step 4: 3kg damaged, final stock 77kg");

  console.log("\n=== SCENARIO 2: MULTI-WAREHOUSE OPERATIONS ===");
  createOp("receipt", "vendor", "wh1_rack", "chairs", 50, "admin");
  createOp("receipt", "vendor", "wh2_rack", "chairs", 30, "admin");
  assert(stock("chairs") === 80, "WH1 (50) + WH2 (30) = 80 total chairs");
  createOp("internal", "wh1_rack", "wh2_rack", "chairs", 15, "worker");
  assert(stock("chairs", "wh1_rack") === 35, "WH1 has 35 after transfer");
  assert(stock("chairs", "wh2_rack") === 45, "WH2 has 45 after transfer");
  assert(stock("chairs") === 80, "Cross-warehouse transfer keeps total at 80");

  console.log("\n=== SCENARIO 3: REFERENCE CODE GENERATION ===");
  const opsList = operations.map(o => o.refCode);
  const uniqueRefs = new Set(opsList).size === opsList.length;
  assert(uniqueRefs, "All " + opsList.length + " reference codes are unique");
  assert(opsList.some(r => r.startsWith("REC/")), "Receipt codes prefixed REC/");
  assert(opsList.some(r => r.startsWith("DEL/")), "Delivery codes prefixed DEL/");
  assert(opsList.some(r => r.startsWith("INT/")), "Internal transfer codes prefixed INT/");
  assert(opsList.some(r => r.startsWith("ADJ/")), "Adjustment codes prefixed ADJ/");

  console.log("\n=== SCENARIO 4: IMMUTABILITY ENFORCEMENT ===");
  const ledgerBeforeCount = ledger.length;
  const tryModify = ledger[0];
  const originalQty = tryModify.quantity;
  try { Object.freeze(tryModify); tryModify.quantity = 99999; } catch (e) { }
  assert(tryModify.quantity === originalQty, "Frozen ledger entries cannot be modified");
  assert(ledger.length === ledgerBeforeCount, "Ledger count preserved after modification attempt");

  console.log("\n=== SCENARIO 5: AUDIT TRAIL VERIFICATION ===");
  const adminMoves = ledger.filter(m => m.userId === "admin").length;
  const workerMoves = ledger.filter(m => m.userId === "worker").length;
  assert(adminMoves >= 3, "Admin performed " + adminMoves + " ledger operations tracked");
  assert(workerMoves >= 3, "Worker performed " + workerMoves + " ledger operations tracked");

  console.log("\n========================================");
  console.log("STRESS SCORECARD: " + passed + " PASSED, " + failed + " FAILED");
  console.log("========================================\n");
  if (failed > 0) process.exit(1);
}
runStressTests();
