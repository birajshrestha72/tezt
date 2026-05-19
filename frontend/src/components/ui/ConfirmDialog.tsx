import React from 'react';
import { MdWarning } from 'react-icons/md';
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly dangerous?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  dangerous = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="" size="sm">
      <div className="confirm-dialog">
        {dangerous && <MdWarning style={{ color: 'var(--danger)' }} />}
        <p className="confirm-dialog__title">{title}</p>
        <p className="confirm-dialog__msg">{message}</p>
        <div className="confirm-dialog__btns">
          <Button variant="ghost" size="md" onClick={onCancel}>Cancel</Button>
          <Button variant={dangerous ? 'danger' : 'primary'} size="md" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
