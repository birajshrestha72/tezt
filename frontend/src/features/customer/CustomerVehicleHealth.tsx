import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MdAutoFixHigh, MdDirectionsCar, MdWarning, MdCheckCircle, MdInfo } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { aiService, type MaintenancePrediction } from '../../services/api/aiService';
import { orderService } from '../../services/api/orderService';
import { StatCard } from '../../components/ui';
import { formatRelativeTime } from '../../utils/format';

function computeHealth(predictions: MaintenancePrediction[]): string {
  const hasCritical = predictions.some(p => p.severity === 'Critical');
  if (hasCritical) return 'Poor';
  const hasWarning = predictions.some(p => p.severity === 'Warning');
  if (hasWarning) return 'Fair';
  return 'Good';
}

function healthColor(h: string): string {
  if (h === 'Poor') return 'var(--danger)';
  if (h === 'Fair') return 'var(--warning)';
  return 'var(--success)';
}

function severityClass(s: string): string {
  if (s === 'Critical') return 'critical';
  if (s === 'Warning') return 'warning';
  return 'good';
}

function SeverityIcon({ s }: Readonly<{ s: string }>) {
  if (s === 'Critical') return <MdWarning style={{ color: 'var(--danger)' }} />;
  if (s === 'Warning') return <MdInfo style={{ color: 'var(--warning)' }} />;
  return <MdCheckCircle style={{ color: 'var(--success)' }} />;
}

export default function CustomerVehicleHealth() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<MaintenancePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const runDiagnostics = async () => {
    if (!user?.vehicleMake || !user?.vehicleModel || !user?.vehicleYear) {
      toast.error('Please complete your vehicle profile first.');
      return;
    }
    setLoading(true);
    try {
      let recentParts: string[] = [];
      try {
        const orders = await orderService.getCustomerOrders(user.id);
        recentParts = orders.flatMap(o => (o.items ?? []).map(i => i.productName)).slice(0, 10);
      } catch (err) {
        console.error('[CustomerVehicleHealth] load orders error:', err);
      }
      const result = await aiService.getDiagnostics(user.vehicleMake, user.vehicleModel, user.vehicleYear, recentParts);
      setPredictions(result);
      setLastScan(new Date().toISOString());
      setRan(true);
    } catch (err) {
      console.error('[CustomerVehicleHealth] diagnostics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasVehicle = !!(user?.vehicleMake && user?.vehicleModel && user?.vehicleYear);

  if (!hasVehicle) {
    return (
      <div>
        <div className="page-header customer-page-header">
          <div className="customer-page-header__title">
            <MdAutoFixHigh style={{ fontSize: 26, color: 'var(--amber)' }} />
            <h2 className="page-title">Vehicle Health</h2>
          </div>
        </div>
        <div className="alert alert-warning" style={{ marginBottom: 'var(--xl)' }}>
          Please complete your vehicle profile to use AI diagnostics.
        </div>
        <button className="btn btn-warning" onClick={() => navigate('/customer/profile')}>
          <MdDirectionsCar /> Go to Profile
        </button>
      </div>
    );
  }

  const health = ran ? computeHealth(predictions) : null;
  const issueCount = predictions.filter(p => p.severity !== 'Good').length;

  return (
    <div>
      <div className="page-header customer-page-header">
        <div className="customer-page-header__title">
          <MdAutoFixHigh style={{ fontSize: 26, color: 'var(--amber)' }} />
          <h2 className="page-title">Vehicle Health</h2>
        </div>
      </div>

      <div className="vehicle-header vehicle-health-hero">
        <div className="vehicle-header__icon"><MdDirectionsCar /></div>
        <div className="vehicle-health-hero__content">
          <p className="vehicle-health-hero__title">{user?.vehicleMake} {user?.vehicleModel} {user?.vehicleYear}</p>
          <p className="vehicle-health-hero__meta">{user?.vehicleType || 'Vehicle'} · Plate: {user?.vehicleNumber || '—'}</p>
        </div>
        <button className="btn btn-primary vehicle-health-hero__action" onClick={runDiagnostics} disabled={loading}>
          {loading
            ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
            : <><MdAutoFixHigh /> Run AI Diagnostics</>}
        </button>
      </div>

      {ran && health && (
        <div className="stats-grid vehicle-health-stats">
          <StatCard
            label="Overall Health"
            value={health}
            accentColor={healthColor(health)}
          />
          <StatCard
            label="Last Scan"
            value={lastScan ? formatRelativeTime(lastScan) : '—'}
            accentColor="var(--info)"
          />
          <StatCard
            label="Issues Found"
            value={issueCount}
            accentColor={issueCount > 0 ? 'var(--danger)' : 'var(--success)'}
          />
        </div>
      )}

      {!ran && !loading && (
        <div className="card vehicle-health-empty">
          <MdAutoFixHigh style={{ fontSize: 48, color: 'var(--amber)', marginBottom: 'var(--md)' }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--lg)' }}>Run AI diagnostics to see vehicle health predictions.</p>
          <button className="btn btn-primary vehicle-health-empty__action" onClick={runDiagnostics}>Run Diagnostics</button>
        </div>
      )}

      {ran && (predictions.length === 0) && !loading && (
        <div className="card vehicle-health-empty">
          <MdCheckCircle style={{ fontSize: 48, color: 'var(--success)', marginBottom: 'var(--md)' }} />
          <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>All Systems Nominal</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No issues detected. Your vehicle looks healthy!</p>
        </div>
      )}

      {predictions.map(p => (
        <div key={p.component} className={`diag-card ${severityClass(p.severity)}`}>
          <div className="diag-card__header">
            <p className="diag-card__component">{p.component}</p>
            <SeverityIcon s={p.severity} />
          </div>
          <p className="diag-card__msg">{p.message}</p>
          <p className="diag-card__action">{p.recommendedAction}</p>
          {p.estimatedCost && <p className="diag-card__cost">Est. cost: {p.estimatedCost}</p>}
        </div>
      ))}
    </div>
  );
}
