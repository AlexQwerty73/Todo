import { useState } from 'react';
import styles from './DayModal.module.css';
import { Todo } from '../../redux/todosApi';
import { useDelTodoMutation, useUpdateTodoMutation, useAddTodoMutation, useAddHistoryMutation } from '../../redux';
import { useToast } from '../../context/ToastContext';
import { loadFromLocalStorage } from '../../utils';

interface DayModalProps {
   date: Date;
   todos: Todo[];
   onClose: () => void;
}

const toDatetimeLocal = (date: Date) => {
   const pad = (n: number) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00`;
};

export const DayModal = ({ date, todos, onClose }: DayModalProps) => {
   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();
   const [addTodo] = useAddTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const userId = loadFromLocalStorage<string>('user') ?? '';

   // new task form
   const [showAdd, setShowAdd] = useState(false);
   const [newTitle, setNewTitle] = useState('');
   const [newDesc, setNewDesc] = useState('');
   const [newDeadline, setNewDeadline] = useState(toDatetimeLocal(date));

   // edit state
   const [editingId, setEditingId] = useState<string | null>(null);
   const [editTitle, setEditTitle] = useState('');
   const [editDesc, setEditDesc] = useState('');
   const [editDeadline, setEditDeadline] = useState('');

   const formatted = date.toLocaleDateString([], {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
   });

   const toggleComplete = (todo: Todo) => {
      updateTodo({ ...todo, completed: !todo.completed }).unwrap();
      showToast(!todo.completed ? 'Task completed! ✓' : 'Task reopened');
   };

   const handleDelete = (todo: Todo) => {
      delTodo(todo.id);
      addHistory({ userId, action: 'deleted', title: todo.title, timestamp: new Date().toISOString() });
      showToast('Task deleted', 'error');
   };

   const handleAdd = () => {
      if (!newTitle.trim()) return;
      addTodo({
         userId,
         title: newTitle.trim(),
         completed: false,
         description: newDesc.trim(),
         deadline: newDeadline || undefined,
      }).unwrap();
      addHistory({ userId, action: 'added', title: newTitle.trim(), timestamp: new Date().toISOString() });
      showToast('Task added');
      setNewTitle('');
      setNewDesc('');
      setNewDeadline(toDatetimeLocal(date));
      setShowAdd(false);
   };

   const startEdit = (todo: Todo) => {
      setEditingId(todo.id);
      setEditTitle(todo.title);
      setEditDesc(todo.description ?? '');
      setEditDeadline(todo.deadline ?? '');
   };

   const handleSave = (todo: Todo) => {
      updateTodo({ ...todo, title: editTitle, description: editDesc, deadline: editDeadline || undefined }).unwrap();
      addHistory({ userId, action: 'updated', title: editTitle, timestamp: new Date().toISOString() });
      showToast('Task updated');
      setEditingId(null);
   };

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={e => e.stopPropagation()}>

            <div className={styles.modalHeader}>
               <h3 className={styles.modalTitle}>{formatted}</h3>
               <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <ul className={styles.list}>
               {todos.length === 0 && !showAdd && (
                  <p className={styles.empty}>No tasks this day</p>
               )}
               {todos.map(todo => (
                  <li key={todo.id} className={`${styles.item} ${todo.completed ? styles.itemDone : ''}`}>
                     {editingId === todo.id ? (
                        <div className={styles.editBlock}>
                           <input
                              className={styles.editInput}
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              placeholder="Title"
                              autoFocus
                           />
                           <textarea
                              className={styles.editTextarea}
                              value={editDesc}
                              onChange={e => setEditDesc(e.target.value)}
                              placeholder="Description (optional)"
                              rows={2}
                           />
                           <div className={styles.editDeadlineRow}>
                              <label className={styles.editLabel}>Deadline</label>
                              <input
                                 type="datetime-local"
                                 className={styles.editDeadlineInput}
                                 value={editDeadline}
                                 onChange={e => setEditDeadline(e.target.value)}
                              />
                           </div>
                           <div className={styles.editActions}>
                              <button className={styles.saveBtn} onClick={() => handleSave(todo)}>Save</button>
                              <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                           </div>
                        </div>
                     ) : (
                        <>
                           <div className={styles.itemLeft}>
                              <button
                                 className={`${styles.check} ${todo.completed ? styles.checkDone : ''}`}
                                 onClick={() => toggleComplete(todo)}
                              />
                              <div className={styles.itemInfo}>
                                 <span className={styles.itemTitle}>{todo.title}</span>
                                 {todo.description && <span className={styles.itemDesc}>{todo.description}</span>}
                                 {todo.deadline && (
                                    <span className={styles.itemTime}>
                                       {new Date(todo.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 )}
                              </div>
                           </div>
                           <div className={styles.itemActions}>
                              <button className={styles.editBtn} onClick={() => startEdit(todo)}>✎</button>
                              <button className={styles.delBtn} onClick={() => handleDelete(todo)}>✕</button>
                           </div>
                        </>
                     )}
                  </li>
               ))}
            </ul>

            {showAdd && (
               <div className={styles.addBlock}>
                  <input
                     className={styles.editInput}
                     value={newTitle}
                     onChange={e => setNewTitle(e.target.value)}
                     placeholder="Task title"
                     autoFocus
                  />
                  <textarea
                     className={styles.editTextarea}
                     value={newDesc}
                     onChange={e => setNewDesc(e.target.value)}
                     placeholder="Description (optional)"
                     rows={2}
                  />
                  <div className={styles.editDeadlineRow}>
                     <label className={styles.editLabel}>Deadline</label>
                     <input
                        type="datetime-local"
                        className={styles.editDeadlineInput}
                        value={newDeadline}
                        onChange={e => setNewDeadline(e.target.value)}
                     />
                  </div>
                  <div className={styles.editActions}>
                     <button className={styles.saveBtn} onClick={handleAdd}>Add task</button>
                     <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
               </div>
            )}

            {!showAdd && (
               <button className={styles.addBtn} onClick={() => setShowAdd(true)}>
                  + Add task
               </button>
            )}

         </div>
      </div>
   );
};