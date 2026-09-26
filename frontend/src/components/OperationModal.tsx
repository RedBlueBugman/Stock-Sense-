import React, { useState, useEffect } from "react";
import { X, Layers, AlertTriangle } from "lucide-react";
import { ApiService } from "../services/api";
import { Product, Location } from "../types";

export const OperationModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess: () => void; defaultType?: string }> = ({
  isOpen, onClose, onSuccess, defaultType = "receipt"
}) => {
  const [opType, setOpType] = useState<string>(defaultType);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [srcLoc, setSrcLoc] = useState("");
  const [destLoc, setDestLoc] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 10, unitOfMeasure: "pcs" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setOpType(defaultType); }, [defaultType]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([ApiService.getProducts(), ApiService.getLocations()])
      .then(([p, l]) => {
        setProducts(p);
        setLocations(l);
        const vendor = l.find((x) => x.locationType === "vendor") || l[0];
        const customer = l.find((x) => x.locationType === "customer") || l[0];
        const internal = l.find((x) => x.locationType === "internal") || l[0];
        const loss = l.find((x) => x.locationType === "loss") || l[0];

        if (opType === "receipt") { setSrcLoc(vendor?.id || ""); setDestLoc(internal?.id || ""); }
        else if (opType === "delivery") { setSrcLoc(internal?.id || ""); setDestLoc(customer?.id || ""); }
        else if (opType === "adjustment") { setSrcLoc(internal?.id || ""); setDestLoc(loss?.id || ""); }
        else { setSrcLoc(internal?.id || ""); setDestLoc(l.filter((x) => x.locationType === "internal")[1]?.id || internal?.id || ""); }

        if (p.length > 0) setItems([{ productId: p[0].id, quantity: 10, unitOfMeasure: p[0].unitOfMeasure || "pcs" }]);
      });
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Execute Stock Movement</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-2 bg-slate-950 p-1 rounded-xl">
            {["receipt", "delivery", "internal", "adjustment"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOpType(type)}
                className={`py-2 text-xs font-semibold rounded-lg capitalize transition ${
                  opType === type ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Source (From)</label>
              <select value={srcLoc} onChange={(e) => setSrcLoc(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationType})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Destination (To)</label>
              <select value={destLoc} onChange={(e) => setDestLoc(e.target.value)} required className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white">
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.locationType})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300 block">Line Item</label>
            <div className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-8">
                <select
                  value={items[0]?.productId}
                  onChange={(e) => setItems([{ ...items[0], productId: e.target.value }])}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="col-span-4">
                <input
                  type="number"
                  min="1"
                  value={items[0]?.quantity}
                  onChange={(e) => setItems([{ ...items[0], quantity: parseFloat(e.target.value) || 1 }])}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white text-right"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl">
              {loading ? "Committing..." : "Commit Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};