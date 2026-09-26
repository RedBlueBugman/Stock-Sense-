import React, { useState, useEffect } from "react";
import { X, Layers, CheckCircle2, AlertTriangle } from "lucide-react";
import { ApiService } from "../services/api";
import { Product, Location, Partner } from "../types";

interface OperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultType?: "receipt" | "delivery" | "internal" | "adjustment";
}

export const OperationModal: React.FC<OperationModalProps> = ({ isOpen, onClose, onSuccess, defaultType = "receipt" }) => {
  const [opType, setOpType] = useState<"receipt" | "delivery" | "internal" | "adjustment">(defaultType);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [srcLoc, setSrcLoc] = useState("");
  const [destLoc, setDestLoc] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 10, unitOfMeasure: "pcs" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setOpType(defaultType);
  }, [defaultType]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([ApiService.getProducts(), ApiService.getLocations(), ApiService.getPartners()])
      .then(([p, l, part]) => {
        setProducts(p);
        setLocations(l);
        setPartners(part);

        const vendor = l.find((x) => x.locationType === "vendor") || l[0];
        const customer = l.find((x) => x.locationType === "customer") || l[0];
        const internal = l.find((x) => x.locationType === "internal") || l[0];
        const loss = l.find((x) => x.locationType === "loss") || l[0];

        if (opType === "receipt") {
          setSrcLoc(vendor?.id || "");
          setDestLoc(internal?.id || "");
        } else if (opType === "delivery") {
          setSrcLoc(internal?.id || "");
          setDestLoc(customer?.id || "");
        } else if (opType === "adjustment") {
          setSrcLoc(internal?.id || "");
          setDestLoc(loss?.id || "");
        } else {
          setSrcLoc(internal?.id || "");
          setDestLoc(l.filter((x) => x.locationType === "internal")[1]?.id || internal?.id || "");
        }

        if (p.length > 0) {
          setItems([{ productId: p[0].id, quantity: 10, unitOfMeasure: p[0].unitOfMeasure || "pcs" }]);
        }
      })
      .catch((err) => setError(err.message));
  }, [isOpen, opType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await ApiService.executeOperation({
        operationType: opType,
        sourceLocationId: srcLoc,
        destinationLocationId: destLoc,
        partnerId: partnerId || undefined,
        notes,
        items: items.map((i) => ({ ...i, quantity: Number(i.quantity) })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to commit transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (index: number, pId: string) => {
    const prod = products.find((x) => x.id === pId);
    const newItems = [...items];
    newItems[index] = { ...newItems[index], productId: pId, unitOfMeasure: prod?.unitOfMeasure || "pcs" };
    setItems(newItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden animate-in fade-in">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Execute Double-Entry Stock Movement</h2>
              <p className="text-xs text-slate-400">Atomic ledger transaction with instant balance calculations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-400 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {(["receipt", "delivery", "internal", "adjustment"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOpType(type)}
                className={`py-2 text-xs font-semibold rounded-lg capitalize transition ${
                  opType === type
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Source Location (From)</label>
              <select
                value={srcLoc}
                onChange={(e) => setSrcLoc(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.locationType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Destination Location (To)</label>
              <select
                value={destLoc}
                onChange={(e) => setDestLoc(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.locationType})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">Move Line Items</label>
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-7">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => {
                      const copy = [...items];
                      copy[idx].quantity = parseFloat(e.target.value) || 0;
                      setItems(copy);
                    }}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="col-span-2 text-xs text-slate-400 font-mono pl-1">{item.unitOfMeasure}</div>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 mb-1 block">Transaction Narration / Notes</label>
            <input
              type="text"
              placeholder="e.g., Stock delivery for Sales Order #402"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
            >
              {loading ? <span>Committing...</span> : <span>Commit to Ledger</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};