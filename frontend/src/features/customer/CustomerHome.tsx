import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdDirectionsCar, MdHistory, MdCalendarToday, MdHealthAndSafety, MdStar, MdStarBorder, MdSend } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/api/orderService';
import { appointmentService } from '../../services/api/appointmentService';
import { reviewService, type ReviewRecord } from '../../services/api/reviewService';
import { StatCard } from '../../components/ui';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StarPicker({ value, onChange }: Readonly<{ value: number; onChange: (n: number) => void }>) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star${n <= value ? ' on' : ''}`}
          onClick={() => onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 24,
            color: n <= value ? 'var(--amber)' : 'var(--border)',
            padding: '0 2px',
          }}
        >
          {n <= value ? <MdStar /> : <MdStarBorder />}
        </button>
      ))}
    </div>
  );
}

const QUICK = [
  { label: 'My Profile',     icon: <MdDirectionsCar />,   path: '/customer/profile' },
  { label: 'Order History',  icon: <MdHistory />,         path: '/customer/history' },
  { label: 'Appointments',   icon: <MdCalendarToday />,   path: '/customer/appointments' },
  { label: 'Vehicle Health', icon: <MdHealthAndSafety />, path: '/customer/ai' },
] as const;

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState(0);
  const [apptCount, setApptCount] = useState(0);
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setStatsLoading(true);
      if (!user?.id) { setStatsLoading(false); return; }
      const [ordRes, apptRes, revRes] = await Promise.allSettled([
        orderService.getCustomerOrders(user.id),
        appointmentService.getAppointmentsByCustomer(user.id),
        reviewService.getReviews(),
      ]);
      if (ordRes.status === 'fulfilled') setOrderCount(ordRes.value.length);
      else console.error('[CustomerHome] orders error:', ordRes.reason);
      if (apptRes.status === 'fulfilled') setApptCount(apptRes.value.filter(a => a.status !== 'Cancelled').length);
      else console.error('[CustomerHome] appointments error:', apptRes.reason);
      if (revRes.status === 'fulfilled') setReviews(revRes.value.slice(-3).reverse());
      else console.error('[CustomerHome] reviews error:', revRes.reason);
      setStatsLoading(false);
    };
    void load();
  }, [user?.id]);

  const onSubmitReview = async () => {
    if (!user?.id) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({ customerId: user.id, rating, comment: comment.trim() || null });
      setComment('');
      setRating(5);
      const updated = await reviewService.getReviews();
      setReviews(updated.slice(-3).reverse());
    } catch (err) {
      console.error('[CustomerHome] submit review error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p style={{ fontSize: 'var(--head-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name ?? 'Customer'}
          </p>
          <p className="page-subtitle">Welcome to your Wrench Mob portal</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <StatCard loading={statsLoading} label="Total Orders" value={orderCount} hint="Parts ordered for your vehicle" accentColor="var(--info)" onClick={() => navigate('/customer/history')} />
        <StatCard loading={statsLoading} label="Active Appointments" value={apptCount} hint="Upcoming service bookings" accentColor="var(--amber)" onClick={() => navigate('/customer/appointments')} />
      </div>

      <div className="quick-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', maxWidth: 480 }}>
        {QUICK.map(q => (
          <button key={q.path} className="quick-btn" onClick={() => navigate(q.path)}>
            {q.icon}
            <span style={{ fontSize: 12, fontWeight: 600 }}>{q.label}</span>
          </button>
        ))}
      </div>

      {user?.vehicleMake && (
        <div className="vehicle-header" style={{ marginTop: 'var(--xl)' }}>
          <div className="vehicle-header__icon"><MdDirectionsCar /></div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{user.vehicleMake} {user.vehicleModel} {user.vehicleYear}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Plate: {user.vehicleNumber || '—'} · {user.vehicleType || 'Vehicle'}</p>
          </div>
        </div>
      )}

      {/* About */}
      <div className="card" style={{ padding: 'var(--lg)', marginTop: 'var(--xl)' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--sm)' }}>About Wrench Mob</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Wrench Mob is your trusted vehicle parts & service management platform. Browse our catalogue,
          book appointments, and track your service history — all in one place.
        </p>
      </div>

      {/* Reviews */}
      <div className="card" style={{ padding: 'var(--lg)', marginTop: 'var(--xl)' }}>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--md)' }}>Leave a Review</p>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          className="form-textarea"
          style={{ marginTop: 'var(--sm)' }}
          placeholder="Share your experience…"
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
        />
        <button
          className="btn btn-primary btn-sm"
          style={{ marginTop: 'var(--sm)' }}
          disabled={submittingReview}
          onClick={onSubmitReview}
        >
          {submittingReview
            ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
            : <><MdSend /> Submit Review</>}
        </button>
      </div>

      {(reviews.length ?? 0) > 0 && (
        <div style={{ marginTop: 'var(--lg)' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--md)' }}>Recent Reviews</p>
          {reviews.map(r => (
            <div key={r.id} className="card review-card" style={{ padding: 'var(--md)', marginBottom: 'var(--sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{r.customerName}</span>
                <span style={{ color: 'var(--amber)', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
