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

export const HistoryPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: history, isLoading } = useGetHistoryQuery(id ?? '');

   if (isLoading) return <p className={styles.loading}>Loading...</p>;

   const sorted = [...(history ?? [])].reverse();

   return (
      <div className={styles.page}>
         <h2 className={styles.title}>Action history</h2>

         {sorted.length === 0
            ? <p className={styles.empty}>No actions yet</p>
            : (
               <ul className={styles.list}>
                  {sorted.map(entry => {
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
            )
         }
      </div>
   );
};