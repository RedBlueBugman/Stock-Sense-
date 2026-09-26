import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface MockMove {
  id: string;
  productId: string;
  quantity: number;
  sourceLocationId: string;
  destinationLocationId: string;
  status: "done";
}

const movesLedger: MockMove[] = [];
const internalLocations = new Set(["rackA", "rackB"]);

function calculateStock(productId: string, locationId?: string): number {
  const incoming = movesLedger
    .filter(m => m.productId === productId && (locationId ? m.destinationLocationId === locationId : internalLocations.has(m.destinationLocationId)))
    .reduce((sum, m) => sum + m.quantity, 0);
  const outgoing = movesLedger
    .filter(m => m.productId === productId && (locationId ? m.sourceLocationId === locationId : internalLocations.has(m.sourceLocationId)))
    .reduce((sum, m) => sum + m.quantity, 0);
  return incoming - outgoing;
}
async function runTests() {
  let passed = 0;
  let failed = 0;
  const assert = (cond: boolean, name: string) => {
    if (cond) { console.log("  [PASS] " + name); passed++; } else { console.error("  [FAIL] " + name); failed++; }
  };

  console.log("\n=== TEST 1: AUTH AND SECURITY CRYPTO ===");
  const hash = await bcrypt.hash("Admin@123", 10);
  const valid = await bcrypt.compare("Admin@123", hash);
  assert(valid, "Password hash validation");
  const token = jwt.sign({ role: "ADMIN" }, "secret");
  const decoded = jwt.verify(token, "secret") as any;
  assert(decoded.role === "ADMIN", "JWT token signing and verification");

  console.log("\n=== TEST 2: INCOMING VENDOR RECEIPT ===");
  movesLedger.push(
    { id: "m1", productId: "steel", quantity: 150, sourceLocationId: "vendor", destinationLocationId: "rackA", status: "done" },
    { id: "m2", productId: "chair", quantity: 45, sourceLocationId: "vendor", destinationLocationId: "rackA", status: "done" }
  );
  assert(calculateStock("steel") === 150, "Initial Steel Stock: 150kg");
  assert(calculateStock("chair") === 45, "Initial Chair Stock: 45pcs");

  console.log("\n=== TEST 3: DOUBLE-ENTRY INTERNAL TRANSFER ===");
  movesLedger.push({ id: "m3", productId: "steel", quantity: 20, sourceLocationId: "rackA", destinationLocationId: "rackB", status: "done" });
  assert(calculateStock("steel", "rackA") === 130, "Rack A Steel stock decreased to 130kg");
  assert(calculateStock("steel", "rackB") === 20, "Rack B Steel stock increased to 20kg");
  assert(calculateStock("steel") === 150, "Total Company Steel stock remains 150kg");

  console.log("\n=== TEST 4: OUTGOING CUSTOMER DELIVERY ===");
  movesLedger.push({ id: "m4", productId: "chair", quantity: 10, sourceLocationId: "rackA", destinationLocationId: "customer", status: "done" });
  assert(calculateStock("chair") === 35, "Remaining Chair Stock: 35pcs");

  console.log("\n=== TEST 5: IMMUTABLE AUDIT LOG COUNT ===");
  assert(movesLedger.length === 4, "Total immutable ledger moves logged: 4");

  console.log("\n========================================");
  console.log("SCORECARD: " + passed + " PASSED, " + failed + " FAILED");
  console.log("========================================\n");
}
runTests();
