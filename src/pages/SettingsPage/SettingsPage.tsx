import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
   useGetHistoryQuery,
   useDeleteHistoryMutation,
   useDeleteUserMutation,
   useDelTodoMutation,
   useGetTodosByUserIdQuery,
} from '../../redux';
import {
   loadFromLocalStorage,
   saveToLocalStorage,
   removeKeyFromLocalStorage,
   loadSettings,
   getSettingsKey,
   UserSettings,
} from '../../utils';
import { Priority } from '../../redux/todosApi';
import { useToast } from '../../context/ToastContext';
import styles from './SettingsPage.module.css';

const priorityColors: Record<Priority, string> = {
   high: '#f07070',
   medium: '#e0a060',
   low: '#4caf7d',
};

const priorityIcons: Record<Priority, string> = {
   high: '↑',
   medium: '→',
   low: '↓',
};

export const SettingsPage = () => {
   const { id }        = useParams<{ id: string }>();
   const navigate      = useNavigate();
   const { showToast } = useToast();

   const userId = id ?? '';
   const key    = getSettingsKey(userId);

   const initial = loadSettings(userId);

   const [defaultPriority, setDefaultPriority] = useState<Priority>(initial.defaultPriority);
   const [historyPageSize, setHistoryPageSize]  = useState<number>(initial.historyPageSize);
   const [confirmDelete,   setConfirmDelete]     = useState(false);
   const [confirmClear,    setConfirmClear]      = useState(false);

   const { data: history = [] } = useGetHistoryQuery(userId);
   const { data: todos   = [] } = useGetTodosByUserIdQuery(userId);

   const [deleteHistory] = useDeleteHistoryMutation();
   const [deleteUser]    = useDeleteUserMutation();
   const [delTodo]       = useDelTodoMutation();

   const handleSave = () => {
      const updated: UserSettings = { defaultPriority, historyPageSize };
      saveToLocalStorage(key, updated);
      showToast('Settings saved ✓');
   };

   const clearHistory = async () => {
      await Promise.all(history.map(e => deleteHistory(e.id)));
      showToast('History cleared');
      setConfirmClear(false);
   };

   const deleteAccount = async () => {
      await Promise.all([
         ...todos.map(t => delTodo(t.id).unwrap().catch(() => {})),
         ...history.map(e => deleteHistory(e.id).unwrap().catch(() => {})),
      ]);
      await deleteUser(userId).unwrap().catch(() => {});
      removeKeyFromLocalStorage('user');
      removeKeyFromLocalStorage(key);
      navigate('/login');
   };

   return (
      <div className={styles.page}>

         {/* ── Header ── */}
         <div className={styles.header}>
            <div className={styles.titleArea}>
               <span className={styles.pageLabel}>Preferences</span>
               <h1 className={styles.title}>Settings</h1>
            </div>
         </div>

         {/* ── Task defaults ── */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h2 className={styles.sectionTitle}>Task defaults</h2>
               <p className={styles.sectionDesc}>Applied automatically when creating a new task.</p>
            </div>
            <div className={styles.card}>
               <div className={styles.row}>
                  <div className={styles.rowLabel}>
                     <span className={styles.rowTitle}>Default priority</span>
                     <span className={styles.rowHint}>Pre-selected when the add form opens</span>
                  </div>
                  <div className={styles.priorityBtns}>
                     {(['high', 'medium', 'low'] as Priority[]).map(p => (
                        <button
                           key={p}
                           className={styles.priorityBtn}
                           style={{
                              borderColor: defaultPriority === p ? priorityColors[p] : '#2a2a2e',
                              color:       defaultPriority === p ? priorityColors[p] : '#555',
                              background:  defaultPriority === p ? `${priorityColors[p]}18` : 'transparent',
                           }}
                           onClick={() => setDefaultPriority(p)}
                        >
                           <span>{priorityIcons[p]}</span> {p}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* ── History ── */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h2 className={styles.sectionTitle}>History</h2>
               <p className={styles.sectionDesc}>Control how your activity log is displayed.</p>
            </div>
            <div className={styles.card}>
               <div className={styles.row}>
                  <div className={styles.rowLabel}>
                     <span className={styles.rowTitle}>Items per page</span>
                     <span className={styles.rowHint}>How many records to show at once</span>
                  </div>
                  <div className={styles.sizeBtns}>
                     {[5, 10, 20, 50].map(n => (
                        <button
                           key={n}
                           className={`${styles.sizeBtn} ${historyPageSize === n ? styles.sizeBtnActive : ''}`}
                           onClick={() => setHistoryPageSize(n)}
                        >{n}</button>
                     ))}
                  </div>
               </div>
            </div>
         </section>

         {/* ── Save ── */}
         <div className={styles.saveRow}>
            <button className={styles.saveBtn} onClick={handleSave}>Save settings</button>
         </div>

         {/* ── Danger zone ── */}
         <section className={styles.section}>
            <div className={styles.sectionHeader}>
               <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>Danger zone</h2>
               <p className={styles.sectionDesc}>These actions are permanent and cannot be undone.</p>
            </div>
            <div className={`${styles.card} ${styles.dangerCard}`}>

               {/* Clear history */}
               <div className={styles.dangerRow}>
                  <div className={styles.rowLabel}>
                     <span className={styles.rowTitle}>Clear history</span>
                     <span className={styles.rowHint}>
                        Delete all {history.length} activity record{history.length !== 1 ? 's' : ''}
                     </span>
                  </div>
                  {confirmClear ? (
                     <div className={styles.confirmRow}>
                        <span className={styles.confirmText}>Are you sure?</span>
                        <button className={styles.dangerConfirmBtn} onClick={clearHistory}>Clear</button>
                        <button className={styles.cancelBtn} onClick={() => setConfirmClear(false)}>Cancel</button>
                     </div>
                  ) : (
                     <button
                        className={styles.dangerBtn}
                        onClick={() => setConfirmClear(true)}
                        disabled={history.length === 0}
                     >Clear all</button>
                  )}
               </div>

               <div className={styles.dangerDivider} />

               {/* Delete account */}
               <div className={styles.dangerRow}>
                  <div className={styles.rowLabel}>
                     <span className={styles.rowTitle}>Delete account</span>
                     <span className={styles.rowHint}>
                        Remove your profile, {todos.length} task{todos.length !== 1 ? 's' : ''} and all history
                     </span>
                  </div>
                  {confirmDelete ? (
                     <div className={styles.confirmRow}>
                        <span className={styles.confirmText}>Are you sure?</span>
                        <button className={styles.dangerConfirmBtn} onClick={deleteAccount}>Delete</button>
                        <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)}>Cancel</button>
                     </div>
                  ) : (
                     <button className={styles.dangerBtn} onClick={() => setConfirmDelete(true)}>
                        Delete account
                     </button>
                  )}
               </div>

            </div>
         </section>

      </div>
   );
};
