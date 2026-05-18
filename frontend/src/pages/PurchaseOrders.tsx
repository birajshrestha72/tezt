import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseOrderService, type PurchaseOrderRecord } from '../services/api/purchaseOrderService';

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<PurchaseOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await purchaseOrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
  }, []);

  const handleReceive = async (id: string) => {
    setMessage('');
    try {
      await purchaseOrderService.markReceived(id);
      await loadOrders();
      setMessage('Purchase order marked as received.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to receive order.');
    }
  };

  const handleCancel = async (id: string) => {
    setMessage('');
    try {
      await purchaseOrderService.cancel(id);
      await loadOrders();
      setMessage('Purchase order cancelled.');
    } catch (error) {
      console.error(error);
      setMessage('Unable to cancel order.');
    }
  };

  const pendingOrders = useMemo(() => orders.filter(order => order.status === 'pending'), [orders]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Purchase Orders</h2>
          <p className="page-subtitle">Review incoming purchase orders and update stock when orders are received.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/admin/purchase/new')}>
          Create Purchase Order
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="toolbar" style={{ marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}><strong>Total orders:</strong> {orders.length}</div>
        <div style={{ minWidth: 180 }}><strong>Pending:</strong> {pendingOrders.length}</div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total</th>
              <th>Ordered</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.slice(0, 8)}</td>
                <td>{order.supplierName || 'Unknown'}</td>
                <td>{order.status}</td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
                <td>{order.receivedAt ? new Date(order.receivedAt).toLocaleDateString() : '—'}</td>
                <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {order.status === 'pending' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => void handleReceive(order.id)}>
                        Receive
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => void handleCancel(order.id)}>
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {!orders.length && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
                  No purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <div className="alert alert-info">Loading purchase orders…</div>}
    </div>
  );
}
