# MEMBER 4: FEATURES & INTEGRATION — "THE GLUE & THE EDGE"

## Your Role

You own everything that makes StockSense work in the real world: barcode scanning, offline sync, the edge gateway, alerts, notifications, CSV import/export, real-time WebSocket layer, and file uploads. You are the bridge between the digital system and the physical warehouse floor. If your features fail, warehouse workers go back to paper.

---

## Phase 1: Barcode Scanning Module (Week 2-4)

### 1. Mobile barcode/QR scanning engine
- Use `expo-camera` + `expo-barcode-scanner` (or `react-native-vision-camera` with barcode plugin for better performance).
- Supported formats: Code128, Code39, EAN-13, EAN-8, QR Code, UPC-A.
- Performance target: scan recognition in **< 500ms** from camera frame.
- Build a reusable `<BarcodeScanner />` component that Member 3 drops into the scan screen.
- Props: `onScan(barcode: string)`, `onScanError()`, `isActive`, `scanRegion`.
- Handle edge cases:
  - Blurry/partial barcodes → retry with haptic feedback
  - Duplicate rapid scans → debounce (ignore same barcode within 2 sec)
  - Unknown barcode → show "Product not found" + manual search option
  - Low light → auto-enable torch toggle button

### 2. Location barcode scanning
- Workers scan location barcodes (on racks/bins) to confirm they're at the right place before picking/putting.
- Flow: Scan location barcode → API validates location → green/red feedback.
- Build a `<LocationScanner />` component separate from product scanner.

### 3. Scan result processing
- When a barcode is scanned, call backend API:
  `GET /api/v1/products?barcode=X` → returns product details + current stock
- If product found: display product info, photo, expected quantity.
- If not found: offer manual SKU search.
- After worker confirms quantity: submit to operations API (Member 2's endpoint) to create/append a `stock_move`.

### 4. Visual and audio feedback system
- Correct scan: green overlay flash + pleasant chime sound + haptic tap.
- Wrong item/location: red overlay flash + loud buzzer + strong haptic.
- Use `expo-av` for sounds, `expo-haptics` for vibration.
- All feedback must work even when screen is in sunlight (high contrast).

---

## Phase 2: Offline Sync Engine (Week 4-7) — Your Hardest Challenge

### 5. WatermelonDB setup (mobile local database)
- Define WatermelonDB schema mirroring backend tables: `products`, `locations`, `stock_operations`, `stock_moves`, `sync_queue`.
- `sync_queue` table (this is your outbox):
  `{ id, operation_type, payload_json, status: pending/syncing/synced/failed, created_at, retry_count, last_error }`
- All local data is read-only cache **except** `sync_queue`, which is write-heavy.

### 6. Offline operation creation
When worker creates a receipt/delivery/transfer while offline:
1. Create the operation locally in WatermelonDB with a temp UUID.
2. Add to `sync_queue` with `status='pending'`.
3. Show worker a "Saved offline — will sync when connected" toast.
4. Stock display updates locally (optimistic UI) with a "pending" badge.

When worker scans items while offline:
1. Append to the local operation's moves.
2. Add each move to `sync_queue`.
3. No API calls — everything is local.

### 7. Sync protocol (the critical part)
Build a `SyncService` class:
- Monitor network status (NetInfo library).
- When connection restored → start sync cycle.
- **PULL first:** `GET /api/v1/sync/pull?since=<last_sync_timestamp>`
  - Receive all server changes since last sync.
  - Apply to local WatermelonDB (upsert products, locations, operations).
  - Update `last_sync_timestamp`.
- **PUSH second:** Read all `sync_queue` items with `status='pending'`.
  - Batch send: `POST /api/v1/sync/push`
    Body: `[{ temp_id, operation_type, payload }]`
  - Server processes each item:
    - Success → returns `{ temp_id, server_id, status: 'synced' }`
    - Conflict → returns `{ temp_id, status: 'rejected', reason }`
  - Update `sync_queue`: mark synced items, flag rejected items.
- **Handle rejected items:**
  - Show worker a notification: "Operation [X] failed — [reason]"
  - Example reason: "Insufficient stock — item was picked by another worker"
  - Worker must manually resolve (cancel or adjust).
- **Retry logic:** failed items retry 3 times with exponential backoff (1min, 5min, 15min). After 3 failures → mark as `'failed'`, alert user.

### 8. Conflict resolution rules
- **SERVER WINS ALWAYS.** The local device state is "intent," not "truth."
- If two workers pick the same last item offline:
  - First sync succeeds, stock goes to 0.
  - Second sync is rejected: "Insufficient stock."
  - Second worker gets a clear error and must return the item.
- Never auto-resolve conflicts silently. Always inform the worker.

### 9. Edge Gateway (for large warehouses with dead zones)
Build a lightweight Node.js service that runs on a local machine (Raspberry Pi, Intel NUC, or old laptop) connected to warehouse Wi-Fi. It acts as a local sync server:
- Has its own SQLite database (mirror of recent operations).
- Workers' devices sync to the Edge Gateway over local Wi-Fi (no internet needed).
- Edge Gateway syncs to cloud when internet is available.

API endpoints (same as cloud but local):
```
POST /local/sync/push
GET  /local/sync/pull?since=X
```

- Discovery: devices find the Edge Gateway via mDNS/Bonjour (`expo-local-network` or `react-native-zeroconf`).
- Fallback: if Edge Gateway unreachable, devices queue locally and sync directly to cloud when internet returns.

---

## Phase 3: Alerts & Notifications (Week 6-8)

### 10. Alert engine (backend service)
Subscribe to Member 2's event emitter:
- `stock.level.changed` → check reorder rules
- `stock.operation.completed` → check for anomalies

**Low stock alert logic:**
1. After every stock change, query `reorder_rules` for that product+warehouse.
2. If `current_qty <= min_qty` AND no active alert exists for this product → insert into `alerts` table, push notification to assigned managers.
3. If `current_qty > max_qty` → alert "Overstocked" (optional).

**Out of stock alert:**
- If `current_qty == 0` → critical alert, `priority='critical'`.

**Expiry warning (cron job, runs daily at 6 AM):**
1. Query `product_lots WHERE expiry_date < NOW() + 30 days`.
2. Create warning alerts for each.
3. If `expiry_date < NOW() + 7 days` → critical alert.
4. If `expiry_date < NOW()` → flag lot as expired, prevent picking.

### 11. Notification delivery
**In-app notifications:**
- WebSocket connection (you build the WS server).
- On new alert → push to connected clients via WS.
- Frontend shows notification badge + toast.

**Push notifications (mobile):**
- Use Expo Push Notifications service.
- Register device push token on login.
- Send push for critical alerts only (don't spam).

**Email notifications:**
- Use a transactional email service (Resend, SendGrid, or AWS SES).
- Daily digest for non-critical alerts.
- Immediate email for critical (out of stock, expiry).

**Notification preferences:**
- Users configure which alerts they receive and via which channel.
- Store in `user_settings` table (coordinate with DB member).

### 12. WebSocket real-time layer
- Set up WebSocket server (Socket.io or native `ws` library).
- Channels:
  - `dashboard:updates` → KPI changes, new operations
  - `warehouse:{id}:moves` → real-time stock movements per warehouse
  - `user:{id}:notifications` → personal alerts
- Authentication: validate JWT on WS connection handshake.
- Reconnection: auto-reconnect with exponential backoff on client side.
- Heartbeat: ping/pong every 30 seconds to detect dead connections.

---

## Phase 4: CSV Import/Export & File Uploads (Week 7-9)

### 13. CSV bulk import
**`POST /api/v1/import/products`** (CSV file upload)
1. Parse CSV (use `papaparse` or `csv-parser`).
2. Validate every row: required fields, SKU uniqueness, valid categories.
3. Return preview: "X rows valid, Y rows with errors."
4. On confirm: bulk insert valid rows, return error report for invalid.
5. Handle large files (10,000+ rows): process in batches of 500, use streaming parser, don't load entire file in memory.

**`POST /api/v1/import/stock`** (initial stock baseline)
1. CSV format: `SKU, Location, Quantity`.
2. Creates adjustment operations for each row.
3. This is how new warehouses get their initial counts into the system.

### 14. CSV/Excel export
```
GET /api/v1/export/products?format=csv
GET /api/v1/export/moves?date_from=X&date_to=Y&format=xlsx
GET /api/v1/export/stock-valuation?warehouse_id=X&format=csv
```
- Use streaming responses for large exports (don't buffer in memory).
- Support both CSV and XLSX formats (use `exceljs` for XLSX).

### 15. File upload service
**`POST /api/v1/upload/presigned-url`**
1. Generate S3/R2 presigned URL for direct client upload.
2. Return URL + fields to frontend.
3. Frontend uploads directly to S3 (bypasses your server for large files).

- Supported: product images (JPEG, PNG, WebP, max 5MB).
- Image processing: resize to 800x800 thumbnail on upload (use Sharp library or Cloudflare Images).
- Store image URL in `products.image_url`.

---

## Phase 5: Integration & Testing (Week 9-10)

### 16. Integration testing
**Test the full offline → sync → conflict flow end-to-end:**
1. Two devices offline, both pick the same item.
2. Device A syncs first → succeeds.
3. Device B syncs second → rejected.
4. Verify Device B shows clear error to worker.

**Test barcode scanning in real warehouse conditions:**
- Low light, damaged barcodes, reflective surfaces.
- Scan speed: can a worker scan 50 items in 2 minutes?

**Test Edge Gateway failover:**
1. Kill internet → verify local sync still works.
2. Restore internet → verify cloud sync catches up.
3. Kill Edge Gateway → verify devices fall back to cloud.

### 17. Performance benchmarks
- Sync cycle (100 pending operations): **< 5 seconds**
- Barcode scan → product lookup → display: **< 1 second**
- CSV import (10,000 products): **< 30 seconds**
- WebSocket message delivery: **< 200ms**

---

## Deliverables Checklist

- [ ] BarcodeScanner component (mobile, expo-camera)
- [ ] LocationScanner component (mobile)
- [ ] Scan feedback system (visual + audio + haptic)
- [ ] WatermelonDB local schema + sync_queue
- [ ] Offline operation creation flow
- [ ] SyncService (pull → push → conflict handling)
- [ ] Edge Gateway service (local Node.js + SQLite)
- [ ] Alert engine (low stock, out of stock, expiry)
- [ ] Notification delivery (in-app WS, push, email)
- [ ] WebSocket server with channels
- [ ] CSV import (products + stock baseline)
- [ ] CSV/XLSX export (products, moves, valuation)
- [ ] File upload service (presigned URLs + image processing)
- [ ] Integration tests for offline sync + conflicts
- [ ] Performance benchmarks document

---

## Dependencies

- You need Member 2's event emitter to hook your alert engine.
- You need Member 2's sync endpoints (`POST /sync/push`, `GET /sync/pull`) — agree on payload shape early, Member 2 builds the server side.
- You need Member 3's scan screen UI to wire your camera module into.
- You need DB member's schema to set up WatermelonDB mirror.
- You do **NOT** touch ledger logic (Member 2).
- You do **NOT** touch frontend UI design (Member 3). You provide components.

---

## Rules

- Offline sync is the hardest feature. Do **NOT** underestimate it. Budget 40% of your time here.
- **NEVER** auto-resolve sync conflicts silently. Always inform the user. Silent data loss is worse than an error message.
- Barcode scanning must work in terrible conditions. Test in a real warehouse with bad lighting and crumpled labels, not just your desk.
- The Edge Gateway is a v2 feature. For v1, focus on device-level offline queue + direct cloud sync. Edge Gateway only if you have time.
- Alert fatigue is real. Don't send 50 notifications per hour. Batch non-critical alerts into digests.
- CSV import must **NEVER** crash the server on malformed input. Validate everything, reject gracefully, return detailed error reports.
