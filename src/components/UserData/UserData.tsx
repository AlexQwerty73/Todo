import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
   useGetUsersQuery, useGetTodosByUserIdQuery, useGetHistoryQuery,
} from '../../redux';
import { User } from '../../redux/usersApi';
import styles from './userPage.module.css';
import html2canvas from 'html2canvas';
import { getTagColor } from '../TagPicker';

// ── Иконки для типов активности ──────────────────────────────────────────────
const ACTION_ICON: Record<string, { icon: string; color: string }> = {
   added:     { icon: '+',  color: '#4caf7d22' },
   completed: { icon: '✓',  color: '#7c5cfc22' },
   deleted:   { icon: '✕',  color: '#f0707022' },
   reopened:  { icon: '↺',  color: '#e0a06022' },
   updated:   { icon: '✎',  color: '#5ca8fc22' },
};

const getTimeAgo = (timestamp: string) => {
   const diff = Date.now() - new Date(timestamp).getTime();
   const mins  = Math.floor(diff / 60000);
   const hours = Math.floor(mins / 60);
   const days  = Math.floor(hours / 24);
   if (mins < 1)  return 'just now';
   if (mins < 60) return `${mins}m ago`;
   if (hours < 24) return `${hours}h ago`;
   return `${days}d ago`;
};

// ── Скелетон ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
   <div className={styles.skeleton}>
      <div className={styles.skeletonCard}>
         <div className={styles.skeletonTop}>
            <div className={`${styles.skeletonAvatar} ${styles.shimmer}`} />
            <div className={styles.skeletonLines}>
               <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ width: '55%' }} />
               <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ width: '70%' }} />
               <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ width: '40%' }} />
            </div>
         </div>
         <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ height: 36 }} />
         <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ height: 36 }} />
      </div>
      <div className={styles.skeletonCard}>
         <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ width: '30%', height: 8 }} />
         <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ height: 60 }} />
         <div className={`${styles.skeletonLine} ${styles.shimmer}`} style={{ height: 6 }} />
      </div>
   </div>
);

// ── Главный компонент ─────────────────────────────────────────────────────────
export const UserData = () => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();

   const { data, isLoading }         = useGetUsersQuery(id);
   const { data: todos   = [] }      = useGetTodosByUserIdQuery(id ?? '');
   const { data: history = [] }      = useGetHistoryQuery(id ?? '');

   const user = !Array.isArray(data) ? data as User : null;

   const [exportingPng, setExportingPng] = useState(false);

   const printRef = useRef<HTMLDivElement>(null);

   // ── Статистика ──────────────────────────────────────────────────────────
   const totalTasks     = todos.length;
   const completedTasks = todos.filter(t => t.completed).length;
   const activeTasks    = totalTasks - completedTasks;
   const overdueTasks   = todos.filter(
      t => t.deadline && !t.completed && new Date(t.deadline) < new Date()
   ).length;
   const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

   // ── История ─────────────────────────────────────────────────────────────
   const sortedHistory = [...history].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
   );
   const recentActivity = sortedHistory.slice(0, 5);

   const lastAction = sortedHistory[0] ?? null;

   const firstAction   = history.length > 0
      ? [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
      : null;
   const memberSince = firstAction
      ? new Date(firstAction.timestamp).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
      : null;

   // ── Priority breakdown ──────────────────────────────────────────────────
   const PRIORITY_META = [
      { key: 'high',   label: 'High',   color: '#f07070' },
      { key: 'medium', label: 'Medium', color: '#e0a060' },
      { key: 'low',    label: 'Low',    color: '#4caf7d' },
   ] as const;

   const priorityBreakdown = PRIORITY_META.map(p => {
      const count = todos.filter(t => (t.priority ?? 'medium') === p.key).length;
      const pct   = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
      return { ...p, count, pct };
   });

   // ── Tags overview ────────────────────────────────────────────────────────
   const tagCounts = new Map<string, number>();
   todos.forEach(t => (t.tags ?? []).forEach(tag =>
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
   ));
   const maxTagCount = Math.max(...Array.from(tagCounts.values()), 1);
   const tagStats = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({
         tag,
         count,
         pct: Math.round((count / maxTagCount) * 100),
      }));

   // ── Upcoming deadlines (next 7 days) ────────────────────────────────────
   const now7     = new Date();
   const in7days  = new Date(now7.getTime() + 7 * 24 * 60 * 60 * 1000);
   const upcomingDeadlines = todos
      .filter(t =>
         t.deadline &&
         !t.completed &&
         new Date(t.deadline) >= now7 &&
         new Date(t.deadline) <= in7days
      )
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 7);

   const priorityColors: Record<string, string> = {
      high: '#f07070', medium: '#e0a060', low: '#4caf7d',
   };

   const formatCountdown = (deadline: string) => {
      const diff  = new Date(deadline).getTime() - Date.now();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days  = Math.floor(hours / 24);
      if (hours < 1)  return { label: 'soon',         soon: true };
      if (hours < 24) return { label: `in ${hours}h`, soon: hours < 6 };
      if (days === 1) return { label: 'tomorrow',     soon: false };
      return { label: `in ${days} days`, soon: false };
   };

   const formatShortDate = (deadline: string) =>
      new Date(deadline).toLocaleDateString([], { day: 'numeric', month: 'short' });

   // ── Экспорт ─────────────────────────────────────────────────────────────
   const exportJSON = () => {
      const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'tasks.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
   };

   const exportCSV = () => {
      const header = 'title,completed,deadline,description';
      const rows = todos.map(t =>
         `"${t.title}",${t.completed},"${t.deadline ?? ''}","${t.description ?? ''}"`
      );
      const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'tasks.csv'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
   };

   const exportPNG = async () => {
      if (!printRef.current) return;
      setExportingPng(true);
      try {
         const canvas = await html2canvas(printRef.current, {
            backgroundColor: '#0e0e10', scale: 2, useCORS: true,
         });
         const url = canvas.toDataURL('image/png');
         const a = document.createElement('a');
         a.href = url; a.download = 'tasks.png'; a.click();
      } finally { setExportingPng(false); }
   };

   // ── Скелетон ────────────────────────────────────────────────────────────
   if (isLoading) return <Skeleton />;

   const avatarLetters = user?.name?.trim().slice(0, 2).toUpperCase() ?? '??';

   return (
      <div className={styles.page}>

         {/* ══════════ Левая колонка: профиль + активность ══════════ */}
         <div className={styles.colLeft}>

            {/* ══ Профиль ══ */}
            <div className={styles.profileCard}>
               <div className={styles.profileTop}>
                  <div className={styles.profileLeft}>
                     <div className={styles.avatar}>{avatarLetters}</div>
                     <div className={styles.profileInfo}>
                        <p className={styles.profileName}>{user?.name ?? '—'}</p>
                        <p className={styles.profileEmail}>{user?.email ?? '—'}</p>
                        {memberSince && (
                           <p className={styles.memberSince}>Member since {memberSince}</p>
                        )}
                     </div>
                  </div>
                  <button className={styles.editBtn} onClick={() => navigate('edit')}>
                     Edit profile
                  </button>
               </div>

               <div className={styles.divider} />

               <div className={styles.fields}>
                  <div className={styles.field}>
                     <span className={styles.fieldLabel}>Phone</span>
                     {user?.phone
                        ? <span className={styles.fieldValue}>{user.phone}</span>
                        : <span className={styles.fieldEmpty}>not set</span>
                     }
                  </div>
                  <div className={styles.field}>
                     <span className={styles.fieldLabel}>Password</span>
                     <div className={styles.passwordRow}>
                        <span className={styles.fieldValue}>••••••••</span>
                        <button
                           className={styles.showPassBtn}
                           onClick={() => navigate('edit')}
                        >
                           Change
                        </button>
                     </div>
                  </div>
               </div>

               {lastAction && (
                  <div className={styles.lastActivity}>
                     <div className={styles.lastActivityDot} />
                     <p className={styles.lastActivityText}>
                        {lastAction.action}{' '}
                        <strong>"{lastAction.title}"</strong>
                     </p>
                     <span className={styles.lastActivityTime}>
                        {getTimeAgo(lastAction.timestamp)}
                     </span>
                  </div>
               )}
            </div>

            {/* ══ Недавняя активность ══ */}
            <div className={styles.activityCard}>
               <p className={styles.cardTitle}>Recent activity</p>
               {recentActivity.length > 0 ? (
                  <div className={styles.activityList}>
                     {recentActivity.map((entry, i) => {
                        const meta = ACTION_ICON[entry.action] ?? { icon: '·', color: '#2a2a2e' };
                        return (
                           <div key={i} className={styles.activityItem}>
                              <span
                                 className={styles.activityIcon}
                                 style={{ background: meta.color }}
                              >
                                 {meta.icon}
                              </span>
                              <span className={styles.activityText}>
                                 {entry.action}{' '}
                                 <span className={styles.activityTitle}>"{entry.title}"</span>
                              </span>
                              <span className={styles.activityAgo}>
                                 {getTimeAgo(entry.timestamp)}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <p className={styles.activityEmpty}>No activity yet</p>
               )}
            </div>

            {/* ══ Tags overview ══ */}
            <div className={styles.tagsCard}>
               <p className={styles.cardTitle}>Tags overview</p>
               {tagStats.length > 0 ? (
                  <div className={styles.tagsList}>
                     {tagStats.map(({ tag, count, pct }) => (
                        <div key={tag} className={styles.tagRow}>
                           <span
                              className={styles.tagDot}
                              style={{ background: getTagColor(tag) }}
                           />
                           <span
                              className={styles.tagName}
                              style={{ color: getTagColor(tag) }}
                           >
                              {tag}
                           </span>
                           <div className={styles.tagTrack}>
                              <div
                                 className={styles.tagFill}
                                 style={{
                                    width: `${pct}%`,
                                    background: getTagColor(tag),
                                    opacity: 0.45,
                                 }}
                              />
                           </div>
                           <span className={styles.tagCount}>{count}</span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <p className={styles.tagsEmpty}>No tags yet</p>
               )}
            </div>

            {/* ══ Upcoming deadlines ══ */}
            <div className={styles.deadlinesCard}>
               <p className={styles.cardTitle}>Upcoming deadlines</p>
               {upcomingDeadlines.length > 0 ? (
                  <div className={styles.deadlinesList}>
                     {upcomingDeadlines.map(todo => {
                        const cd = formatCountdown(todo.deadline!);
                        return (
                           <div key={todo.id} className={styles.deadlineItem}>
                              <div
                                 className={styles.deadlinePriorityBar}
                                 style={{ background: priorityColors[todo.priority ?? 'medium'] }}
                              />
                              <span className={styles.deadlineTitle}>{todo.title}</span>
                              <span className={styles.deadlineDate}>
                                 {formatShortDate(todo.deadline!)}
                              </span>
                              <span className={`${styles.deadlineBadge} ${cd.soon ? styles.deadlineBadgeSoon : ''}`}>
                                 {cd.label}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               ) : (
                  <p className={styles.deadlinesEmpty}>Nothing due in the next 7 days</p>
               )}
            </div>

         </div>{/* /colLeft */}

         {/* ══════════ Правая колонка: статистика + экспорт + удаление ══════════ */}
         <div className={styles.colRight}>

            {/* ══ Статистика ══ */}
            <div className={styles.statsCard}>
               <p className={styles.cardTitle}>Tasks overview</p>
               {totalTasks === 0 && (
                  <div className={styles.emptyStats}>
                     <span className={styles.emptyStatsIcon}>○</span>
                     <p className={styles.emptyStatsText}>No tasks yet</p>
                     <button
                        className={styles.emptyStatsBtn}
                        onClick={() => navigate(`/user/${id}/todos`)}
                     >Add your first task →</button>
                  </div>
               )}
               {totalTasks > 0 && (
                  <>
                     <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                           <span className={styles.statNum}>{totalTasks}</span>
                           <span className={styles.statLabel}>Total</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.statDone}`}>
                           <span className={styles.statNum}>{completedTasks}</span>
                           <span className={styles.statLabel}>Done</span>
                        </div>
                        <div className={`${styles.statItem} ${styles.statActive}`}>
                           <span className={styles.statNum}>{activeTasks}</span>
                           <span className={styles.statLabel}>Active</span>
                        </div>
                        <div className={`${styles.statItem} ${overdueTasks > 0 ? styles.statOverdue : ''}`}>
                           <span className={styles.statNum}>{overdueTasks}</span>
                           <span className={styles.statLabel}>Overdue</span>
                        </div>
                     </div>
                     <div className={styles.progressRow}>
                        <div className={styles.progressTrack}>
                           <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className={styles.progressLabel}>{progressPct}% complete</span>
                     </div>
                  </>
               )}
            </div>

            {/* ══ Priority breakdown ══ */}
            <div className={styles.priorityCard}>
               <p className={styles.cardTitle}>Priority breakdown</p>
               <div className={styles.priorityList}>
                  {priorityBreakdown.map(({ key, label, color, count, pct }) => (
                     <div key={key} className={styles.priorityRow}>
                        <span className={styles.priorityDot} style={{ background: color }} />
                        <span className={styles.priorityRowLabel}>{label}</span>
                        <div className={styles.priorityTrack}>
                           <div
                              className={styles.priorityFill}
                              style={{ width: `${pct}%`, background: color }}
                           />
                        </div>
                        <span className={styles.priorityCount}>{count}</span>
                        <span className={styles.priorityPct}>{pct}%</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* ══ Экспорт ══ */}
            <div className={styles.exportCard}>
               <p className={styles.cardTitle}>Export tasks</p>
               <div className={styles.exportBtns}>
                  <button className={styles.exportBtn} onClick={exportJSON}>
                     <span className={styles.exportBtnIcon}>&#123;&#125;</span>
                     <span className={styles.exportBtnLabel}>JSON</span>
                  </button>
                  <button className={styles.exportBtn} onClick={exportCSV}>
                     <span className={styles.exportBtnIcon}>⊞</span>
                     <span className={styles.exportBtnLabel}>CSV</span>
                  </button>
                  <button className={styles.exportBtn} onClick={exportPNG} disabled={exportingPng}>
                     <span className={styles.exportBtnIcon}>◻</span>
                     <span className={styles.exportBtnLabel}>{exportingPng ? '...' : 'PNG'}</span>
                  </button>
               </div>
            </div>

            {/* ══ Settings link ══ */}
            <div className={styles.settingsCard}>
               <p className={styles.cardTitle}>Account settings</p>
               <p className={styles.settingsDesc}>
                  Manage task defaults, history display, and account deletion.
               </p>
               <button className={styles.settingsLink} onClick={() => navigate('settings')}>
                  Open Settings →
               </button>
            </div>

         </div>{/* /colRight */}

         {/* ── Скрытый PNG-блок ── */}
         <div
            ref={printRef}
            style={{
               position: 'absolute', left: '-9999px', top: 0,
               width: '600px', background: '#0e0e10', padding: '24px',
               fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
            }}
         >
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px' }}>
               {user?.name} — tasks export — {new Date().toLocaleDateString()}
            </p>
            {todos.map((todo, i) => (
               <div key={todo.id} style={{
                  background: '#1a1a1e', border: '0.5px solid #2a2a2e',
                  borderRadius: '6px', padding: '10px 14px', marginBottom: '6px',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
               }}>
                  <span style={{ color: '#555', fontSize: '12px', minWidth: '20px' }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                     <p style={{
                        color: todo.completed ? '#555' : '#d0d0d0', fontSize: '14px',
                        textDecoration: todo.completed ? 'line-through' : 'none',
                     }}>{todo.title}</p>
                     {todo.description && (
                        <p style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>{todo.description}</p>
                     )}
                     {todo.deadline && (
                        <p style={{ color: '#7c5cfc', fontSize: '11px', marginTop: '2px' }}>
                           ⏱ {new Date(todo.deadline).toLocaleString([], {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                           })}
                        </p>
                     )}
                  </div>
                  <span style={{
                     fontSize: '11px', padding: '2px 8px', borderRadius: '4px',
                     background: todo.completed ? '#1e2a1e' : '#1e1e2e',
                     color: todo.completed ? '#4a7a4a' : '#7c5cfc',
                  }}>
                     {todo.completed ? 'done' : 'active'}
                  </span>
               </div>
            ))}
         </div>

      </div>
   );
};
