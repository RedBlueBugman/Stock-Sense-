'use client';

import React, { useState } from 'react';
import { Card, Button, Input, Select } from '@/components/ui';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Wrench, CheckCircle2 } from 'lucide-react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
}

interface OperationWizardProps {
  onComplete: (data: any) => void;
  warehouses?: { id: string; name: string }[];
  partners?: { id: string; name: string }[];
}

export const OperationWizard: React.FC<OperationWizardProps> = ({
  onComplete,
  warehouses = [
    { id: 'wh-1', name: 'Central Warehouse (WH-01)' },
    { id: 'wh-2', name: 'West Coast Hub (WH-02)' },
  ],
  partners = [
    { id: 'pt-1', name: 'Apex Global Supplies Ltd. (Supplier)' },
    { id: 'pt-2', name: 'Omni Retailers Inc. (Customer)' },
  ],
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    type: 'RECEIPT',
    warehouse: warehouses[0]?.id || '',
    partner: partners[0]?.id || '',
    item_name: 'Heavy Duty Steel Rod 10mm',
    quantity: 50,
    notes: 'Standard incoming shipment batch',
  });

  const steps: WizardStep[] = [
    { id: 'type', title: 'Operation Type', description: 'Select operation type' },
    { id: 'details', title: 'Details', description: 'Fill in warehouse and partner details' },
    { id: 'items', title: 'Items', description: 'Add products and quantities' },
    { id: 'review', title: 'Review', description: 'Review and confirm creation' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between gap-2">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-xs font-semibold uppercase text-slate-500">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title} — {steps[currentStep].description}
        </p>
      </div>

      <Card>
        {currentStep === 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Select Operation Type</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { type: 'RECEIPT', label: 'Receipt', desc: 'Incoming from Supplier', icon: ArrowDownToLine, color: 'text-emerald-600' },
                { type: 'DELIVERY', label: 'Delivery', desc: 'Outgoing to Customer', icon: ArrowUpFromLine, color: 'text-blue-600' },
                { type: 'TRANSFER', label: 'Internal Transfer', desc: 'Between Warehouses', icon: ArrowLeftRight, color: 'text-indigo-600' },
                { type: 'ADJUSTMENT', label: 'Stock Adjustment', desc: 'Inventory count correction', icon: Wrench, color: 'text-amber-600' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = formData.type === item.type;
                return (
                  <label
                    key={item.type}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={item.type}
                      checked={isSelected}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Icon className={`h-4 w-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Operation Routing Details</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Target Warehouse</label>
              <Select
                value={formData.warehouse}
                onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                options={warehouses.map((w) => ({ label: w.name, value: w.id }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Partner / Counterparty</label>
              <Select
                value={formData.partner}
                onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                options={partners.map((p) => ({ label: p.name, value: p.id }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Operation Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="E.g., PO-84920 Expedited Delivery"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Line Items & Quantity</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Product Description</label>
              <Input
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                placeholder="Product name or SKU"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 mb-1">Movement Quantity</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity.toString()}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Review & Confirm Operation</h3>
            <div className="rounded-xl bg-slate-50 border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Operation Type:</span>
                <span className="font-bold text-indigo-700">{formData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-semibold text-slate-800">{formData.item_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quantity:</span>
                <span className="font-bold text-slate-900">{formData.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Notes:</span>
                <span className="text-slate-700">{formData.notes || '—'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? (
              <span className="flex items-center gap-1.5 justify-center">
                <CheckCircle2 className="h-4 w-4" /> Create Operation
              </span>
            ) : (
              'Next Step'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
