import { useEffect } from 'react';

export default function ConfirmModal({
  open,
  title,
  message,
  busy = false,
  confirmLabel = 'Delete',
  confirmVariant = 'btn--danger',
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-modal-title">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={`btn ${confirmVariant}`} onClick={onConfirm} disabled={busy}>
            {busy ? `${confirmLabel}…` : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
