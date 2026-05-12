import React, { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, Filter, RefreshCcw, Clock3, Tag, AlertTriangle } from 'lucide-react';
import { notificationService, type NotificationRecord } from '../services/api/notificationService';

const notificationTypeOptions = ['All types', 'General', 'CreditReminder', 'LowStock'];
const filterOptions = ['all', 'unread', 'read'] as const;

type FilterOption = (typeof filterOptions)[number];

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'Unknown date' : parsed.toLocaleString();
};

const NotificationsView = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [typeFilter, setTypeFilter] = useState('All types');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [items, unread] = await Promise.all([
        notificationService.getNotifications(typeFilter === 'All types' ? undefined : typeFilter),
        notificationService.getUnreadCount(typeFilter === 'All types' ? undefined : typeFilter),
      ]);

      setNotifications(items);
      setUnreadCount(unread.unreadCount);
    } catch (loadError) {
      console.error('Notification load failed:', loadError);
      setError('Failed to load notifications from the API.');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [typeFilter]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === 'unread') return !notification.isRead;
      if (filter === 'read') return notification.isRead;
      return true;
    });
  }, [filter, notifications]);

  const totalCount = notifications.length;
  const readCount = totalCount - unreadCount;
  const creditReminderCount = notifications.filter((notification) => notification.notificationType === 'CreditReminder').length;

  const markOneRead = async (id: number) => {
    setBusyId(id);
    try {
      await notificationService.markAsRead(id);
      await load();
    } catch (markError) {
      console.error('Mark notification read failed:', markError);
      setError('Unable to mark notification as read.');
    } finally {
      setBusyId(null);
    }
  };

  const markAllRead = async () => {
    setBusyId(-1);
    try {
      await notificationService.markAllAsRead();
      await load();
    } catch (markError) {
      console.error('Mark all notifications read failed:', markError);
      setError('Unable to mark all notifications as read.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <section className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-xl shadow-black/10 backdrop-blur md:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Notifications</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">Operational alert center</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              Track unread alerts, process credit reminders, and clear notification workflows without leaving the admin shell.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={loading || unreadCount === 0 || busyId === -1}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total notifications', value: totalCount },
          { label: 'Unread alerts', value: unreadCount, highlight: unreadCount > 0 },
          { label: 'Read alerts', value: readCount },
          { label: 'Credit reminders', value: creditReminderCount },
        ].map((card) => (
          <article key={card.label} className="rounded-3xl border border-white/5 bg-surface-container/70 p-5 shadow-lg shadow-black/10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant">{card.label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className={`text-3xl font-black tracking-tight ${card.highlight ? 'text-amber-300' : 'text-white'}`}>{loading ? '—' : card.value}</h2>
              <Bell className="h-5 w-5 text-primary" />
            </div>
          </article>
        ))}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/5 bg-surface-container/70 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-white/5 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Notification inbox</p>
              <h3 className="mt-1 text-lg font-bold text-white">Read / unread workflow</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === option ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white'
                }`}
              >
                {option === 'all' ? 'All' : option === 'unread' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
            <Tag className="h-4 w-4" />
            Type filter
          </label>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="w-full max-w-sm rounded-xl border border-white/10 bg-surface-container-low px-4 py-3 text-sm text-white outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
          >
            {notificationTypeOptions.map((option) => (
              <option key={option} value={option} className="bg-surface-container text-white">
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="px-5 py-8 text-sm text-on-surface-variant md:px-6">Loading notifications...</div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-start md:justify-between md:px-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {notification.notificationType}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${notification.isRead ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                    {notification.referenceKey && (
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                        {notification.referenceKey}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">{notification.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {formatDate(notification.createdAt)}
                      </span>
                      {notification.payloadJson && <span className="max-w-xl truncate">Payload attached</span>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={() => void markOneRead(notification.id)}
                      disabled={busyId === notification.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCheck className="h-4 w-4" />
                      Mark read
                    </button>
                  )}
                  {notification.notificationType === 'CreditReminder' && (
                    <span className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-200">
                      <AlertTriangle className="h-4 w-4" />
                      Credit reminder
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 md:px-6">
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                <Bell className="mx-auto h-10 w-10 text-on-surface-variant" />
                <h3 className="mt-4 text-lg font-bold text-white">No notifications match the current filter.</h3>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Try a different notification type or refresh after running a workflow that generates alerts.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NotificationsView;
