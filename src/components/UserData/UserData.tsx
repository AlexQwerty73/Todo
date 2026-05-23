import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery, useGetTodosByUserIdQuery, useGetHistoryQuery } from '../../redux';
import { User } from '../../redux/usersApi';
import styles from './userPage.module.css';

interface UserDataProps {
   editMode?: boolean;
}

export const UserData = ({ editMode }: UserDataProps) => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { data, isLoading } = useGetUsersQuery(id);
   const { data: todos = [] } = useGetTodosByUserIdQuery(id ?? '');
   const { data: history = [] } = useGetHistoryQuery(id ?? '');

   const user = !Array.isArray(data) ? data as User : null;
   const [showPassword, setShowPassword] = useState(false);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   // Stats
   const totalTasks = todos.length;
   const completedTasks = todos.filter(t => t.completed).length;
   const activeTasks = totalTasks - completedTasks;
   const overdueTasks = todos.filter(t => t.deadline && !t.completed && new Date(t.deadline) < new Date()).length;
   const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

   // Last activity
   const lastAction = history.length > 0
      ? [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
      : null;

   const getTimeAgo = (timestamp: string) => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      if (mins < 1) return 'just now';
      if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      return `${days} day${days > 1 ? 's' : ''} ago`;
   };

   // Member since — first history entry
   const firstAction = history.length > 0
      ? [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
      : null;

   const memberSince = firstAction
      ? new Date(firstAction.timestamp).toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })
      : null;

   // Export
   const exportJSON = () => {
      const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.json';
      a.click();
      URL.revokeObjectURL(url);
   };

   const exportCSV = () => {
      const header = 'title,completed,deadline,description';
      const rows = todos.map(t =>
         `"${t.title}",${t.completed},"${t.deadline ?? ''}","${t.description ?? ''}"`
      );
      const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.csv';
      a.click();
      URL.revokeObjectURL(url);
   };

   if (isLoading) return <div className={styles.userData}><p className={styles.loading}>Loading...</p></div>;

   return (
      <div className={styles.page}>

         {/* Profile card */}
         <div className={styles.userData}>
            <div className={styles.profileTop}>
               <div className={styles.avatar}>
                  {user?.name?.slice(0, 2).toUpperCase() ?? '??'}
               </div>
               <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{user?.name ?? '—'}</p>
                  <p className={styles.profileEmail}>{user?.email ?? '—'}</p>
                  {memberSince && <p className={styles.memberSince}>Member since {memberSince}</p>}
               </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.fields}>
               <div className={styles.field}>
                  <span className={styles.fieldLabel}>Phone</span>
                  <span className={styles.fieldValue}>{user?.phone ?? '—'}</span>
               </div>
               <div className={styles.field}>
                  <span className={styles.fieldLabel}>Password</span>
                  <span className={styles.fieldValue}>
                     {showPassword ? user?.password ?? '—' : '••••••••'}
                  </span>
               </div>
            </div>

            {lastAction && (
               <p className={styles.lastActivity}>
                  Last activity: <span>{lastAction.action} "{lastAction.title}"</span> — {getTimeAgo(lastAction.timestamp)}
               </p>
            )}

            <div className={styles.btns}>
               <button className={styles.primary} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'} password
               </button>
               <button className={styles.secondary} onClick={() => navigate('edit')}>
                  Edit
               </button>
            </div>
         </div>

         {/* Stats card */}
         <div className={styles.statsCard}>
            <p className={styles.statsTitle}>Tasks overview</p>
            <div className={styles.statsGrid}>
               <div className={styles.statItem}>
                  <span className={styles.statNum}>{totalTasks}</span>
                  <span className={styles.statLabel}>Total</span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statNum}>{completedTasks}</span>
                  <span className={styles.statLabel}>Done</span>
               </div>
               <div className={styles.statItem}>
                  <span className={styles.statNum}>{activeTasks}</span>
                  <span className={styles.statLabel}>Active</span>
               </div>
               <div className={`${styles.statItem} ${overdueTasks > 0 ? styles.statOverdue : ''}`}>
                  <span className={styles.statNum}>{overdueTasks}</span>
                  <span className={styles.statLabel}>Overdue</span>
               </div>
            </div>
            <div className={styles.progressBar}>
               <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>
            <p className={styles.progressLabel}>{progressPercent}% completed</p>
         </div>

         {/* Export card */}
         <div className={styles.exportCard}>
            <p className={styles.statsTitle}>Export tasks</p>
            <div className={styles.exportBtns}>
               <button className={styles.exportBtn} onClick={exportJSON}>
                  Download JSON
               </button>
               <button className={styles.exportBtn} onClick={exportCSV}>
                  Download CSV
               </button>
            </div>
         </div>

         {/* Delete account */}
         <div className={styles.dangerCard}>
            {!showDeleteConfirm ? (
               <button className={styles.deleteBtn} onClick={() => setShowDeleteConfirm(true)}>
                  Delete account
               </button>
            ) : (
               <div className={styles.confirmBlock}>
                  <p className={styles.confirmText}>Are you sure? This cannot be undone.</p>
                  <div className={styles.confirmBtns}>
                     <button className={styles.confirmDelete}>Yes, delete</button>
                     <button className={styles.cancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                  </div>
               </div>
            )}
         </div>

      </div>
   );
};