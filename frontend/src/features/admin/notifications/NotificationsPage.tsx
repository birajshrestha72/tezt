import React, { useEffect, useState } from 'react';
import { MdWarning, MdPayment, MdNotifications, MdDelete } from 'react-icons/md';
import { notificationService, type NotificationRecord } from '../../../services/api/notificationService';
import { Badge, EmptyState } from '../../../components/ui';

type FilterType = 'All' | 'Unread' | 'LowStock' | 'CreditReminder' | 'General';

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function notifClass(type: string): string {
  if (type === 'LowStock') return 'low-stock';
  if (type === 'CreditReminder') return 'credit';
  return 'general';
}

function NotifIcon({ type }: { type: string }) {
  if (type === 'LowStock') return <MdWarning />;
  if (type === 'CreditReminder') return <MdPayment />;
  return <MdNotifications />;
}

const FILTERS: FilterType[] = ['All', 'Unread', 'LowStock', 'CreditReminder', 'General'];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('All');
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    setLoading(true);
    const [notifRes, countRes] = await Promise.allSettled([
      notificationService.getNotifications(),
      notificationService.getUnreadCount(),
    ]);
    if (notifRes.status === 'fulfilled') setNotifications(notifRes.value);
    if (countRes.status === 'fulfilled') setUnreadCount(countRes.value.unreadCount);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = notifications.filter(n => {
    if (filter === 'Unread') return !n.isRead;
    if (filter === 'All') return true;
    return n.notificationType === filter;
  });

  const markRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
  };

  const markAll = async () => {
    await notificationService.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id: number, wasUnread: boolean) => {
    await notificationService.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
  };

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--md)' }}>
          <h2 className="page-title">Notifications</h2>
          {unreadCount > 0 && <Badge variant="danger">{unreadCount}</Badge>}
        </div>
        <button className="btn btn-secondary" onClick={markAll} disabled={unreadCount === 0}>
          Mark All Read
        </button>
      </div>

      <div className="toolbar">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'LowStock' ? 'Low Stock' : f === 'CreditReminder' ? 'Credit' : f}
          </button>
        ))}
      </div>

      {loading ? (
        Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton sk-row" style={{ height: 64, marginBottom: 4, borderRadius: 8 }} />
        ))
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={<MdNotifications />} title="No notifications" />
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {filtered.map(n => (
            <div
              key={n.id}
              className={`notif-item${n.isRead ? '' : ' unread'}`}
              onClick={() => { if (!n.isRead) void markRead(n.id); }}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' && !n.isRead) void markRead(n.id); }}
            >
              <div className={`notif-icon ${notifClass(n.notificationType)}`}>
                <NotifIcon type={n.notificationType} />
              </div>
              <div className="notif-meta">
                <p className="notif-msg" style={{ fontWeight: n.isRead ? 400 : 700 }}>{n.message}</p>
                <p className="notif-time">{relativeTime(n.createdAt)}</p>
                <Badge variant="muted" style={{ fontSize: 10, marginTop: 4 }}>{n.notificationType}</Badge>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {!n.isRead && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={e => { e.stopPropagation(); void markRead(n.id); }}
                  >
                    Mark Read
                  </button>
                )}
                <button
                  className="tbl-btn del"
                  aria-label="Delete"
                  onClick={e => { e.stopPropagation(); void deleteNotif(n.id, !n.isRead); }}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
