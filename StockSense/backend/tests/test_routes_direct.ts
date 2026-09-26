import app from "../src/index";
import http from "http";

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log("Testing against isolated test port 5099...\n");

  const endpoints = [
    { name: "1. Health Check", path: "/api/v1/health" },
    { name: "2. Dashboard KPIs", path: "/api/v1/dashboard/kpis" },
    { name: "3. Products Catalog", path: "/api/v1/products" },
    { name: "4. Warehouses List", path: "/api/v1/warehouses" },
    { name: "5. Locations List", path: "/api/v1/locations" },
    { name: "6. Partners List", path: "/api/v1/partners" },
    { name: "7. Operations Log", path: "/api/v1/operations" },
    { name: "8. Stock Quants", path: "/api/v1/stock/quants" },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`http://localhost:5099${ep.path}`);
      const data = await res.json();
      if (res.status === 200 || res.status === 201) {
        console.log(`  ✅ ${ep.name} -> HTTP ${res.status} OK`);
      } else {
        console.log(`  ❌ ${ep.name} -> HTTP ${res.status}:`, JSON.stringify(data));
      }
    } catch (err: any) {
      console.log(`  ❌ ${ep.name} -> Request Failed:`, err.message);
    }
  }

  console.log("\nDone testing in-process.");
  server.close();
  process.exit(0);
});
