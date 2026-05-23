import { useState } from 'react';
import { TodoItem } from '../TodoItem';
import { Todo } from '../../redux/todosApi';
import styles from './todoList.module.css';

type Filter = 'all' | 'active' | 'completed';

interface TodosListProps {
   todos?: Todo[];
}

const PAGE_SIZE = 7;

export const TodosList = ({ todos }: TodosListProps) => {
   const [filter, setFilter] = useState<Filter>('all');
   const [page, setPage] = useState(1);

   if (!todos) return <p className={styles.loading}>Loading...</p>;

   const filtered = todos.filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
   });

   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
   const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
   const completedCount = todos.filter(t => t.completed).length;

   const handleFilter = (f: Filter) => {
      setFilter(f);
      setPage(1);
   };

   return (
      <div>
         <div className={styles.header}>
            <span className={styles.counter}>
               {completedCount} of {todos.length} completed
            </span>
            <div className={styles.filters}>
               {(['all', 'active', 'completed'] as Filter[]).map(f => (
                  <button
                     key={f}
                     onClick={() => handleFilter(f)}
                     className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                  >
                     {f}
                  </button>
               ))}
            </div>
         </div>

         <ul className={styles.list}>
            {paginated.length > 0
               ? paginated.map((todo, index) =>
                  <TodoItem key={todo.id} index={(page - 1) * PAGE_SIZE + index} todo={todo} />
               )
               : (
                  <div className={styles.empty}>
                     <span className={styles.emptyIcon}>○</span>
                     <p>No tasks here</p>
                     <p className={styles.emptyHint}>
                        {filter === 'all' ? 'Add your first task above' : `No ${filter} tasks`}
                     </p>
                  </div>
               )
            }
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

      </div>
   );
};