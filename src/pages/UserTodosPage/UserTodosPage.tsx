import { useParams } from 'react-router-dom';
import { useGetTodosByUserIdQuery, useGetUsersQuery } from '../../redux/';
import { AddTodoForm, TodosList } from '../../components';
import { User } from '../../redux/usersApi';
import styles from './UserTodosPage.module.css';

const getGreeting = () => {
   const h = new Date().getHours();
   if (h < 12) return 'Good morning';
   if (h < 18) return 'Good afternoon';
   return 'Good evening';
};

const formatDate = () =>
   new Date().toLocaleDateString([], {
      weekday: 'long', month: 'long', day: 'numeric',
   });

export const UserTodosPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: user } = useGetUsersQuery(id);
   const { data: todos } = useGetTodosByUserIdQuery(id ?? '');

   const u = user as User | undefined;
   const firstName = u?.name?.split(' ')[0] ?? '';

   const total     = todos?.length ?? 0;
   const completed = todos?.filter(t => t.completed).length ?? 0;
   const active    = total - completed;
   const overdue   = todos?.filter(
      t => t.deadline && !t.completed && new Date(t.deadline) < new Date()
   ).length ?? 0;

   const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

   return (
      <div className={styles.page}>

         {/* ── Шапка ── */}
         <div className={styles.header}>
            <div className={styles.headerLeft}>
               <h1 className={styles.greeting}>
                  {getGreeting()}{firstName ? `, ${firstName}` : ''} 👋
               </h1>
               <p className={styles.dateText}>{formatDate()}</p>
            </div>

            {todos && (
               <div className={styles.stats}>
                  <div className={styles.stat}>
                     <span className={styles.statVal}>{total}</span>
                     <span className={styles.statLabel}>Total</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                     <span className={styles.statVal} style={{ color: '#4caf7d' }}>{completed}</span>
                     <span className={styles.statLabel}>Done</span>
                  </div>
                  <div className={styles.statDivider} />
                  <div className={styles.stat}>
                     <span className={styles.statVal} style={{ color: '#e0a060' }}>{active}</span>
                     <span className={styles.statLabel}>Active</span>
                  </div>
                  {overdue > 0 && (
                     <>
                        <div className={styles.statDivider} />
                        <div className={styles.stat}>
                           <span className={styles.statVal} style={{ color: '#f07070' }}>{overdue}</span>
                           <span className={styles.statLabel}>Overdue</span>
                        </div>
                     </>
                  )}
               </div>
            )}
         </div>

         {/* ── Прогресс ── */}
         {total > 0 && (
            <div className={styles.progressWrap}>
               <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${pct}%` }} />
               </div>
               <span className={styles.progressLabel}>{pct}% complete</span>
            </div>
         )}

         {/* ── Форма добавления ── */}
         <AddTodoForm />

         {/* ── Список задач ── */}
         <TodosList todos={todos} />

      </div>
   );
};
