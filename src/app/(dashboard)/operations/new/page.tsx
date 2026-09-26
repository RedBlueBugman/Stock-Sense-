'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOperations } from '@/hooks/useOperations';
import { useWarehouses } from '@/hooks/useWarehouses';
import { usePartners } from '@/hooks/usePartners';
import { OperationWizard } from '@/components/operations/OperationWizard';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export default function CreateOperationPage() {
  const router = useRouter();
  const { createOperation } = useOperations();
  const { warehouses } = useWarehouses();
  const { data: partners } = usePartners();

  const handleWizardComplete = async (wizardData: any) => {
    const payload = {
      operation_type: wizardData.type.toLowerCase(),
      warehouse_id: wizardData.warehouse,
      partner_id: wizardData.partner,
      notes: wizardData.notes,
      items: [
        {
          product_name: wizardData.item_name,
          quantity: wizardData.quantity,
          unit_of_measure: 'pcs',
        },
      ],
    };

    await createOperation(payload);
    router.push(ROUTES.OPERATIONS);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <Link href={ROUTES.OPERATIONS} className="rounded-xl border p-2 text-slate-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operation Creation Wizard</h1>
          <p className="text-sm text-slate-500">Step-by-step stock movement dispatch</p>
        </div>
      </div>

      <OperationWizard
        onComplete={handleWizardComplete}
        warehouses={warehouses.map((w) => ({ id: w.id, name: `${w.name} (${w.code})` }))}
        partners={(partners || []).map((p) => ({ id: p.id, name: `${p.name} (${p.type})` }))}
      />
    </div>
  );
}
