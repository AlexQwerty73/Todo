import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetHistoryQuery } from '../../redux';
import { useAppSettings } from '../../context/SettingsContext';
import styles from './HistoryPage.module.css';

const ACTION_META = {
   added:     { label: 'Added',     icon: '✚', color: '#7c5cfc' },
   deleted:   { label: 'Deleted',   icon: '✕', color: '#f07070' },
   completed: { label: 'Completed', icon: '✓', color: '#4caf7d' },
   reopened:  { label: 'Reopened',  icon: '↩', color: '#888'    },
   updated:   { label: 'Updated',   icon: '✎', color: '#e0a060' },
} as const;

type ActionKey = keyof typeof ACTION_META;

const getDayLabel = (date: Date): string => {
   const now  = new Date();
   const diff = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
              - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
   const days = Math.round(diff / 86_400_000);
   if (days === 0) return 'Today';
   if (days === 1) return 'Yesterday';
   return date.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' });
};

const formatTime = (date: Date) =>
   date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const HistoryPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: history, isLoading } = useGetHistoryQuery(id ?? '');
   const pageSize = useAppSettings().historyPageSize;

   const [page,   setPage]   = useState(1);
   const [filter, setFilter] = useState<ActionKey | 'all'>('all');

   // Reset to first page when page size changes
   useEffect(() => { setPage(1); }, [pageSize]);

   const sorted = useMemo(
      () => [...(history ?? [])].reverse(),
      [history],
   );

   const filtered = useMemo(
      () => filter === 'all' ? sorted : sorted.filter(e => e.action === filter),
      [sorted, filter],
   );

   const totalPages = Math.ceil(filtered.length / pageSize);
   const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

   const changeFilter = (f: ActionKey | 'all') => { setFilter(f); setPage(1); };

   /* ── Stats ── */
   const stats = useMemo(() => {
      const counts: Record<string, number> = {};
      for (const e of sorted) counts[e.action] = (counts[e.action] ?? 0) + 1;
      return counts;
   }, [sorted]);

   /* ── Group by day ── */
   const grouped = useMemo(() => {
      const map = new Map<string, typeof paginated>();
      for (const entry of paginated) {
         const d    = new Date(entry.timestamp);
         const key  = getDayLabel(d);
         const prev = map.get(key) ?? [];
         map.set(key, [...prev, entry]);
      }
      return map;
   }, [paginated]);

   if (isLoading) {
      return (
         <div className={styles.page}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} style={{ width: '60%' }} />
            <div className={styles.skeleton} style={{ height: 200 }} />
         </div>
      );
   }

   return (
      <div className={styles.page}>

         {/* ── Header ── */}
         <div className={styles.header}>
            <div className={styles.titleArea}>
               <span className={styles.pageLabel}>Activity</span>
               <h1 className={styles.title}>History</h1>
            </div>
            {sorted.length > 0 && (
               <div className={styles.totalBadge}>{sorted.length} actions</div>
            )}
         </div>

         {/* ── Stat chips ── */}
         {sorted.length > 0 && (
            <div className={styles.statRow}>
               {(Object.keys(ACTION_META) as ActionKey[]).map(key => {
                  const { label, icon, color } = ACTION_META[key];
                  const count = stats[key] ?? 0;
                  if (!count) return null;
                  return (
                     <div key={key} className={styles.statChip} style={{ borderColor: `${color}30` }}>
                        <span className={styles.statIcon} style={{ color }}>{icon}</span>
                        <span className={styles.statLabel}>{label}</span>
                        <span className={styles.statCount} style={{ color }}>{count}</span>
                     </div>
                  );
               })}
            </div>
         )}

         {/* ── Filters ── */}
         {sorted.length > 0 && (
            <div className={styles.filters}>
               <button
                  className={`${styles.filterBtn} ${filter === 'all' ? styles.filterActive : ''}`}
                  onClick={() => changeFilter('all')}
               >All</button>
               {(Object.keys(ACTION_META) as ActionKey[]).filter(k => stats[k]).map(key => (
                  <button
                     key={key}
                     className={`${styles.filterBtn} ${filter === key ? styles.filterActive : ''}`}
                     style={filter === key ? { borderColor: ACTION_META[key].color, color: ACTION_META[key].color } : {}}
                     onClick={() => changeFilter(key)}
                  >
                     {ACTION_META[key].label}
                  </button>
               ))}
            </div>
         )}

         {/* ── Empty ── */}
         {sorted.length === 0 && (
            <div className={styles.emptyState}>
               <span className={styles.emptyIcon}>◎</span>
               <p className={styles.emptyText}>No activity yet</p>
               <p className={styles.emptyHint}>Actions like adding, completing, or deleting tasks will appear here.</p>
            </div>
         )}

         {filtered.length === 0 && sorted.length > 0 && (
            <div className={styles.emptyState}>
               <span className={styles.emptyIcon}>◎</span>
               <p className={styles.emptyText}>No {filter} actions</p>
            </div>
         )}

         {/* ── Timeline ── */}
         {filtered.length > 0 && (
            <div className={styles.timeline}>
               {[...grouped.entries()].map(([day, entries]) => (
                  <div key={day} className={styles.dayGroup}>
                     <div className={styles.dayLabel}>
                        <span className={styles.dayText}>{day}</span>
                        <div className={styles.dayLine} />
                     </div>
                     <ul className={styles.list}>
                        {entries.map(entry => {
                           const { icon, color, label } = ACTION_META[entry.action as ActionKey] ?? ACTION_META.updated;
                           const d = new Date(entry.timestamp);
                           return (
                              <li key={entry.id} className={styles.item}>
                                 <div
                                    className={styles.actionDot}
                                    style={{ background: `${color}22`, borderColor: `${color}55` }}
                                 >
                                    <span style={{ color, fontSize: 11 }}>{icon}</span>
                                 </div>
                                 <div className={styles.itemBody}>
                                    <span className={styles.entryTitle}>{entry.title}</span>
                                    <span className={styles.badge} style={{ color, borderColor: `${color}44`, background: `${color}12` }}>
                                       {label}
                                    </span>
                                 </div>
                                 <span className={styles.time}>{formatTime(d)}</span>
                              </li>
                           );
                        })}
                     </ul>
                  </div>
               ))}
            </div>
         )}

         {/* ── Pagination ── */}
         {totalPages > 1 && (
            <div className={styles.pagination}>
               <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => p - 1)}
                  disabled={page === 1}
               >‹</button>

               {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                     return (
                        <button
                           key={p}
                           onClick={() => setPage(p)}
                           className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                        >{p}</button>
                     );
                  }
                  if (Math.abs(p - page) === 2) {
                     return <span key={p} className={styles.pageDots}>…</span>;
                  }
                  return null;
               })}

               <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === totalPages}
               >›</button>
            </div>
         )}
      </div>
   );
};
