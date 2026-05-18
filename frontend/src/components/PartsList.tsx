import { MdCheckCircle, MdWarning } from 'react-icons/md';
import { type ProductDetailRecord } from '../services/api/productService';

interface PartsListProps {
  parts: ProductDetailRecord[];
  loading: boolean;
}

export default function PartsList({ parts, loading }: PartsListProps) {
  if (loading) {
    return <div className="empty-state">Loading parts…</div>;
  }

  if (!parts.length) {
    return <div className="empty-state">No parts found for the current search or category.</div>;
  }

  return (
    <div className="table-wrap">
      <table className="table" style={{ minWidth: 760 }}>
        <thead>
          <tr>
            <th>Part</th>
            <th>Category</th>
            <th>Supplier</th>
            <th style={{ textAlign: 'right' }}>Price</th>
            <th style={{ textAlign: 'right' }}>Stock</th>
          </tr>
        </thead>
        <tbody>
          {parts.map(part => (
            <tr key={part.id}>
              <td>
                <div style={{ display: 'grid', gap: 4 }}>
                  <strong>{part.name}</strong>
                  <span className="text-muted">{part.sku || 'N/A'}</span>
                </div>
              </td>
              <td>{part.category?.name ?? 'Uncategorized'}</td>
              <td>{part.supplier?.name ?? 'Unknown supplier'}</td>
              <td style={{ textAlign: 'right' }}>${part.price.toFixed(2)}</td>
              <td style={{ textAlign: 'right' }}>
                {part.stockQty < 10 ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--danger)' }}>
                    <MdWarning /> {part.stockQty}
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success)' }}>
                    <MdCheckCircle /> {part.stockQty}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
