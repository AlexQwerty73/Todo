import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetHistoryQuery } from '../../redux';
import styles from './HistoryPage.module.css';

const actionLabels = {
   added: { label: 'Added', color: '#7c5cfc' },
   deleted: { label: 'Deleted', color: '#f07070' },
   completed: { label: 'Completed', color: '#4caf7d' },
   reopened: { label: 'Reopened', color: '#888' },
   updated: { label: 'Updated', color: '#e0a060' },
};

const PAGE_SIZE = 10;

export const HistoryPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: history, isLoading } = useGetHistoryQuery(id ?? '');
   const [page, setPage] = useState(1);

   if (isLoading) return <p className={styles.loading}>Loading...</p>;

   const sorted = [...(history ?? [])].reverse();
   const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
   const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <h2 className={styles.title}>Action history</h2>
            {sorted.length > 0 && (
               <span className={styles.counter}>{sorted.length} actions</span>
            )}
         </div>

         {sorted.length === 0
            ? <p className={styles.empty}>No actions yet</p>
            : (
               <>
                  <ul className={styles.list}>
                     {paginated.map(entry => {
                        const { label, color } = actionLabels[entry.action];
                        const date = new Date(entry.timestamp);
                        return (
                           <li key={entry.id} className={styles.item}>
                              <span className={styles.badge} style={{ color, borderColor: color }}>
                                 {label}
                              </span>
                              <span className={styles.entryTitle}>{entry.title}</span>
                              <span className={styles.time}>
                                 {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </li>
                        );
                     })}
                  </ul>

                  {totalPages > 1 && (
                     <div className={styles.pagination}>
                        <button
                           className={styles.pageBtn}
                           onClick={() => setPage(p => p - 1)}
                           disabled={page === 1}
                        >
                           ‹
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => {
                           const p = i + 1;
                           if (totalPages <= 7 || p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
                              return (
                                 <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                                 >
                                    {p}
                                 </button>
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
                        >
                           ›
                        </button>
                     </div>
                  )}
               </>
            )
         }
      </div>
   );
};