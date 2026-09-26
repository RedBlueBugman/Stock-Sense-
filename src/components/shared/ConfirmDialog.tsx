'use client';

import React from 'react';
import { Modal, Button } from '@/components/ui';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
