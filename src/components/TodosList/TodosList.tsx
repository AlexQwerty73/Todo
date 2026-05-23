import { useState } from 'react';
import { TodoItem } from '../TodoItem';
import { Todo } from '../../redux/todosApi';
import styles from './todoList.module.css';

type Filter = 'all' | 'active' | 'completed';

interface TodosListProps {
   todos?: Todo[];
}

export const TodosList = ({ todos }: TodosListProps) => {
   const [filter, setFilter] = useState<Filter>('all');

   if (!todos) return <p className={styles.loading}>Loading...</p>;

   const filtered = todos.filter(todo => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
   });

   const completedCount = todos.filter(t => t.completed).length;

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
                     onClick={() => setFilter(f)}
                     className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                  >
                     {f}
                  </button>
               ))}
            </div>
         </div>

         <ul className={styles.list}>
            {filtered.length > 0
               ? filtered.map((todo, index) =>
                  <TodoItem key={todo.id} index={index} todo={todo} />
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
      </div>
   );
};