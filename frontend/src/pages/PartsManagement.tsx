import { useEffect, useMemo, useState } from 'react';
import SearchBar from '../components/ui/SearchBar';
import PartsList from '../components/PartsList';
import StockAlert from '../components/StockAlert';
import { productService, type ProductDetailRecord, type ProductOption } from '../services/api/productService';

export default function PartsManagement() {
  const [parts, setParts] = useState<ProductDetailRecord[]>([]);
  const [categories, setCategories] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [error, setError] = useState('');

  const loadParts = async () => {
    setLoading(true);
    setError('');
    try {
      const [partsResponse, categoriesResponse] = await Promise.all([
        productService.getProducts(),
        productService.getCategories(),
      ]);
      setParts(partsResponse);
      setCategories(categoriesResponse);
    } catch (err) {
      console.error(err);
      setError('Unable to load parts. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadParts();
  }, []);

  const filteredParts = useMemo(() => {
    const searchQuery = search.trim().toLowerCase();
    return parts.filter(part => {
      const matchesSearch = !searchQuery || part.name.toLowerCase().includes(searchQuery) || part.sku.toLowerCase().includes(searchQuery);
      const matchesCategory = !categoryId || String(part.categoryId) === categoryId;
      const matchesLowStock = !lowStockOnly || (part.reorderLevel ?? 0) >= 0 && part.stockQty <= (part.reorderLevel ?? 0);
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [parts, search, categoryId, lowStockOnly]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Parts Management</h2>
          <p className="page-subtitle">Search, filter and review the parts inventory by category.</p>
        </div>
      </div>

      <StockAlert
        count={parts.filter(part => part.stockQty <= (part.reorderLevel ?? 0)).length}
        onViewLowStock={() => setLowStockOnly(true)}
      />

      <div className="toolbar" style={{ gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <SearchBar
            value={search}
            onChange={value => setSearch(value)}
            placeholder="Search parts by name or SKU…"
            loading={loading}
          />
        </div>

        <select
          className="form-select"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          style={{ width: 220, minWidth: 180 }}
        >
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <button
          className={`btn btn-sm ${lowStockOnly ? 'btn-warning' : 'btn-secondary'}`}
          onClick={() => setLowStockOnly(value => !value)}
        >
          {lowStockOnly ? 'Show all parts' : 'Show low stock'}
        </button>

        <div style={{ color: 'var(--text-muted)', minWidth: 140 }}>
          Showing {filteredParts.length} of {parts.length} part{parts.length === 1 ? '' : 's'}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <PartsList parts={filteredParts} loading={loading} />
    </div>
  );
}
