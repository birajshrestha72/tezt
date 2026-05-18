type StockAlertProps = {
  count: number;
  onViewLowStock: () => void;
};

export default function StockAlert({ count, onViewLowStock }: StockAlertProps) {
  if (!count) return null;

  return (
    <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <div>
        <strong>{count}</strong> part{count === 1 ? '' : 's'} need restocking. Review inventory and reorder soon.
      </div>
      <button className="btn btn-sm btn-secondary" onClick={onViewLowStock}>
        Show low stock
      </button>
    </div>
  );
}
