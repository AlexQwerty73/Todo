import styles from './DayModal.module.css';
import { Todo } from '../../redux/todosApi';
import { useDelTodoMutation, useUpdateTodoMutation } from '../../redux';
import { useToast } from '../../context/ToastContext';

interface DayModalProps {
   date: Date;
   todos: Todo[];
   onClose: () => void;
}

export const DayModal = ({ date, todos, onClose }: DayModalProps) => {
   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();
   const { showToast } = useToast();

   const formatted = date.toLocaleDateString([], {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
   });

   const toggleComplete = (todo: Todo) => {
      updateTodo({ ...todo, completed: !todo.completed }).unwrap();
      showToast(!todo.completed ? 'Task completed! ✓' : 'Task reopened');
   };

   const handleDelete = (todo: Todo) => {
      delTodo(todo.id);
      showToast('Task deleted', 'error');
   };

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
               <h3 className={styles.modalTitle}>{formatted}</h3>
               <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            {todos.length === 0
               ? <p className={styles.empty}>No tasks this day</p>
               : (
                  <ul className={styles.list}>
                     {todos.map(todo => (
                        <li key={todo.id} className={`${styles.item} ${todo.completed ? styles.itemDone : ''}`}>
                           <div className={styles.itemLeft}>
                              <button
                                 className={`${styles.check} ${todo.completed ? styles.checkDone : ''}`}
                                 onClick={() => toggleComplete(todo)}
                              />
                              <div className={styles.itemInfo}>
                                 <span className={styles.itemTitle}>{todo.title}</span>
                                 {todo.description && (
                                    <span className={styles.itemDesc}>{todo.description}</span>
                                 )}
                                 {todo.deadline && (
                                    <span className={styles.itemTime}>
                                       {new Date(todo.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 )}
                              </div>
                           </div>
                           <button className={styles.delBtn} onClick={() => handleDelete(todo)}>✕</button>
                        </li>
                     ))}
                  </ul>
               )
            }
         </div>
      </div>
   );
};