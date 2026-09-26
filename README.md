# 📦 StockSense - Intelligent Warehouse Inventory Management System

> **Odoo GCET Hackathon Submission**  
> A high-performance, real-time warehouse inventory and operations platform featuring hardware-accelerated optical barcode scanning, proactive hazard and low-stock telemetry alerts, inbound vendor receiving workflows, and strict-validation outbound customer delivery dispatches.

---

## 🌟 Overview & Core Value Proposition

Warehouse operations demand high velocity, absolute inventory accuracy, and instant feedback. **StockSense** unifies end-to-end material flow into a responsive single-page command center:

1. **Hardware & Simulated Barcode Scanning**: Sub-millisecond barcode and QR code decoding from live webcams or simulated test matrices with synthesized Honeywell laser audio feedback.
2. **Dynamic Alert & Hazard Telemetry**: Global notification engine providing multi-tiered alerts (Critical Sirens, Low Stock Warnings, Overstock Alerts, Info Chimes) with live badge tracking and floating toasts.
3. **Inbound Stock Receiving (Thing 3)**: Supplier purchase order fulfillment with live increasing stock projections (`15 ↗ 65`), quantity adjustments, and automated restock telemetry upon completion.
4. **Outbound Customer Delivery (Thing 4)**: Outgoing dispatch engine with **strict real-time validation**, preventing deficits, displaying decreasing stock projections (`65 ↘ 15`), blocking out-of-stock item scans, and triggering post-shipment alerts.
5. **Printable / Digital QR Tag Matrix**: Integrated modal generating high-contrast, scalable QR tags for all warehouse inventory categories to test real camera decoding.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/RedBlueBugman/Stock-Sense-.git
cd "Anto odoo"

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at **`http://localhost:5173`**

### Production Build & Typecheck
```bash
npm run build
npm run preview
```

---

## 🏗️ System Architecture & Workflow Modules

```
                        ┌─────────────────────────────────────────┐
                        │      StockSense Master Dashboard        │
                        │ (Live KPI Overview & Inventory Catalog) │
                        └───────────────────┬─────────────────────┘
                                            │
        ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
        ▼                   ▼                               ▼                   ▼
┌──────────────┐    ┌──────────────┐                ┌──────────────┐    ┌──────────────┐
│   Thing 1    │    │   Thing 2    │                │   Thing 3    │    │   Thing 4    │
│ Optical & QR │    │ Alert Engine │                │ Inbound Flow │    │ Outbound Del │
│  Scanner Hub │    │  & Telemetry │                │  (Receipts)  │    │ (Deliveries) │
└───────┬──────┘    └───────┬──────┘                └───────┬──────┘    └───────┬──────┘
        │                   │                               │                   │
        └───────────────────┴───────────────┬───────────────┴───────────────────┘
                                            │
                                            ▼
                        ┌─────────────────────────────────────────┐
                        │     Global Reactive Inventory State     │
                        │    (Stock Levels, Alerts, Audit Logs)   │
                        └─────────────────────────────────────────┘
```

---

## 🛠️ Feature Breakdown

### 🔍 Thing 1: Optical Barcode & QR Scanner Engine
- **Dual Decoding Engine**: Powered by `jsQR` (universal frame analysis at 60 FPS) and hardware-accelerated Chromium `BarcodeDetector` API.
- **Camera Fallback Hierarchy**: Graceful multi-tiered stream negotiation with camera flip / device switcher for multi-camera workstations.
- **Simulated Test Grid**: 4 demo category cards for instant one-click testing without a physical camera.
- **Audio & Haptic Feedback**: High-frequency synthesized Honeywell scanner confirmation beep via Web Audio API.

### 🚨 Thing 2: Dynamic Alert & Notification Gateway
- **Alert Tiers**:
  - 🚨 **Critical**: Red pulsing banner with loud industrial dual-pulse siren (e.g., zero stock depletion).
  - ⚠️ **Warning**: Amber banner with soft double-tone notification (e.g., stock dropping below minimum reorder threshold).
  - ℹ️ **Info**: Blue banner with pleasant chime (e.g., receipt or shipment dispatched).
- **Interactive Notification Center**: Animated bell icon with live unread badge, filter tabs (All, Critical, Warning, Info), and clear-all actions.
- **Floating Auto-dismiss Toasts**: Non-blocking alerts with animated countdown progress timers.

### 📥 Thing 3: Inbound Goods Receiving Workflow (Receipts)
- **Purchase Order Reference**: Auto-generated sequential receipt IDs (`REC-001`).
- **Live Stock Increase Projection**: Shows real-time upward stock change (e.g., `15 ↗ 65`) with green indicator arrows.
- **Overstock & Low Stock Indicators**: Live badge updates indicating `UNDERSTOCKED`, `OPTIMAL`, or `EXCEEDS MAX`.
- **Completion Safety**: Alert checks fire **only after confirmation**, updating global state, triggering confetti bursts, and logging audit events.

### 🚚 Thing 4: Outgoing Delivery Dispatch Workflow (Deliveries)
- **Strict Pre-flight Deficit Validation**: Outgoing orders cannot be dispatched if requested units exceed warehouse stock ($Q > \text{available}$) or $Q \le 0$.
- **Instant Error Handling**:
  - Row turns red with glowing ring and inline error: `Only X units available for [Product] (Need Y)`.
  - **Ship Order** button is automatically **DISABLED** on deficits with an alert badge: `Fix Stock Deficit to Ship`.
- **Zero-Stock Scan Prevention**: Attempting to scan or add items with `0 units` triggers an instant error buzzer and rejection toast.
- **Live Stock Decrease Projection**: Red downward arrow (`65 ↘ 15`) with dynamic badges:
  - `⛔ INSUFFICIENT` (Red)
  - `🚨 WILL BE OUT OF STOCK` (Orange/Red)
  - `⚠️ LOW STOCK AFTER SHIPMENT` (Yellow)
  - `✅ OK` (Green)
- **Departure Animation**: Success modal featuring animated delivery truck departure, itemized receipt breakdown, and celebration confetti.

### 🖨️ Printable QR Tag Center
- Integrated modal generating high-contrast, high-resolution QR tags for:
  - 🔩 **Steel Rods** (`SR001` - Raw Materials)
  - 🪵 **Wood Planks** (`WP002` - Lumber & Timber)
  - 🪑 **Office Chairs** (`CH003` - Finished Goods)
  - 🛠️ **Workbenches** (`TB004` - Heavy Equipment)
- Supports full-screen modal zoom for phone-to-screen camera scanning and print layout.

---

## 🎯 Demonstration Walkthrough (For Hackathon Judges)

| Step | Action | Expected Behavior |
|---|---|---|
| **1. Explore Inventory** | View Dashboard KPI cards and Product Catalog | Displays live stock levels (Steel Rods: 15, Wood: 45, Chairs: 0, Workbenches: 25). |
| **2. Test Inbound Receipt** | Switch to **📥 Inbound Receipt** tab $\rightarrow$ Click **Load Demo Receipt** $\rightarrow$ Click **Complete Receipt** | Stock increases (+50 Steel Rods, +20 Chairs, +10 Workbenches). Confetti bursts, and restock alerts populate the Alert Center. |
| **3. Test Outbound Delivery Deficit** | Switch to **🚚 Outgoing Delivery** tab $\rightarrow$ Click **Load Invalid Demo** | Steel Rods & Office Chairs exceed available stock. Inputs turn RED, inline deficit errors appear, and **Ship Order button is DISABLED**. |
| **4. Test Zero-Stock Scan** | Open **Scan Item to Ship** $\rightarrow$ Scan / click an item with 0 stock | Industrial error siren sounds, toast shows `❌ Cannot ship: Out of stock`, and item is rejected from order. |
| **5. Ship Valid Delivery** | Click **Load Valid Delivery** $\rightarrow$ Click **📦 Ship Order** | Stock decreases. Low stock warnings trigger post-shipment. Truck departure animation and success summary modal appear. |

---

## ⌨️ Keyboard Shortcuts & Accessibility

- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> : Open Barcode & QR Scanner Modal
- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Enter</kbd> : Submit active Receipt or Ship Delivery Order (when valid)
- <kbd>Escape</kbd> : Close open modals (Scanner, QR Sheet, Validation Error, Success Modal)

---

## 💻 Tech Stack & Dependencies

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Motion & Micro-interactions**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio Engine**: Native Web Audio API Synthesizer (Honeywell beep, Siren, Warning chime)
- **Computer Vision / QR**: [`jsQR`](https://github.com/cozmo/jsQR) & [`qrcode.react`](https://github.com/zpao/qrcode.react)
- **Celebration Effects**: [`canvas-confetti`](https://github.com/catdad/canvas-confetti)

---

## 📂 Project Structure

```
src/
├── components/
│   ├── BarcodeScannerModal.tsx   # Dual camera / simulated scanner modal
│   ├── PrintableQRModal.tsx      # Printable 4-category QR tag sheet
│   ├── QRCodeDisplay.tsx         # High-contrast QR matrix renderer
│   ├── AlertBell.tsx             # Interactive alert header icon with badge
│   ├── AlertDropdown.tsx         # Notification drawer with category filtering
│   ├── AlertToast.tsx            # Floating toast notification with countdown
│   ├── AlertToastContainer.tsx   # Portal container for active toasts
│   ├── receipt/                  # Inbound Receiving Module
│   │   ├── ReceiptPage.tsx       # Inbound workflow controller
│   │   ├── ReceiptItemRow.tsx    # Line item row with steppers & removal
│   │   ├── StockPreview.tsx      # Live increasing stock projection (15 ↗ 65)
│   │   ├── ReceiptSummary.tsx    # Metric calculations & action bar
│   │   └── CompleteReceiptModal.tsx # Receipt confirmation modal
│   └── delivery/                 # Outgoing Delivery Module
│       ├── DeliveryPage.tsx      # Outgoing dispatch controller
│       ├── DeliveryItemRow.tsx   # Line item row with instant deficit validation
│       ├── StockValidation.tsx   # Decreasing stock preview (65 ↘ 15) & badges
│       ├── DeliverySummary.tsx   # Order metrics & disabled ship button logic
│       ├── DeliveryValidationModal.tsx # Detailed deficit breakdown error modal
│       └── ShipSuccessModal.tsx  # Outbound departure truck animation modal
├── context/
│   └── AlertContext.tsx          # Global reactive alert state & dispatcher
├── data/
│   └── mockProducts.ts           # Benchmark product catalog data
├── types/
│   ├── inventory.ts              # Inventory product & category type definitions
│   ├── alert.ts                  # Alert tier and structure interfaces
│   ├── receipt.ts                # Inbound receipt schemas
│   └── delivery.ts               # Outbound delivery schemas
├── utils/
│   ├── audio.ts                  # Web Audio API scanner beep & siren synthesizer
│   ├── alertUtils.ts             # Inventory alert threshold evaluation
│   ├── receiptCalculations.ts    # Inbound stock preview calculation logic
│   ├── deliveryCalculations.ts   # Outbound remaining stock & deficit validation
│   └── qrUtils.ts                # Barcode and QR payload matching engine
├── App.tsx                       # Master single-page dashboard shell
└── main.tsx                      # React root entry point
```

---

## 👥 Contributors

Built for the **Odoo GCET Hackathon**.
