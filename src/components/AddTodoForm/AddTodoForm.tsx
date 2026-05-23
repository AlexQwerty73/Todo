import { useState } from 'react';
import styles from './addTodoForm.module.css';
import { useAddTodoMutation, useAddHistoryMutation } from '../../redux';
import { loadFromLocalStorage } from '../../utils';
import { useToast } from '../../context/ToastContext';
import { Priority } from '../../redux/todosApi';

const priorityOptions: { value: Priority; label: string; color: string }[] = [
   { value: 'high', label: 'High', color: '#f07070' },
   { value: 'medium', label: 'Medium', color: '#e0a060' },
   { value: 'low', label: 'Low', color: '#4caf7d' },
];

export const AddTodoForm = () => {
   const [title, setTitle] = useState('');
   const [description, setDescription] = useState('');
   const [deadline, setDeadline] = useState('');
   const [priority, setPriority] = useState<Priority>('medium');
   const [expanded, setExpanded] = useState(false);

   const [addTodo] = useAddTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const handleAdd = () => {
      const userId = loadFromLocalStorage<string>('user');
      if (!userId || !title.trim()) return;

      addTodo({
         userId,
         title: title.trim(),
         completed: false,
         description: description.trim(),
         deadline: deadline || undefined,
         priority,
      }).unwrap();

      addHistory({
         userId,
         action: 'added',
         title: title.trim(),
         timestamp: new Date().toISOString(),
      });

      showToast('Task added');
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('medium');
      setExpanded(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd();
   };

   return (
      <div className={styles.wrapper}>
         <div className={styles.addTodoForm}>
            <input
               className={styles.inputAdd}
               value={title}
               placeholder='TODO TITLE'
               type="text"
               onChange={e => setTitle(e.target.value)}
               onKeyDown={handleKeyDown}
            />
            <button
               className={`${styles.expandBtn} ${expanded ? styles.expandBtnOpen : ''}`}
               onClick={() => setExpanded(!expanded)}
               title="Add details"
            >
               ›
            </button>
            <button onClick={handleAdd} className={styles.btn}>Add</button>
         </div>

         {expanded && (
            <div className={styles.details}>
               <div className={styles.priorityRow}>
                  {priorityOptions.map(opt => (
                     <button
                        key={opt.value}
                        onClick={() => setPriority(opt.value)}
                        className={styles.priorityBtn}
                        style={{
                           borderColor: priority === opt.value ? opt.color : '#2a2a2e',
                           color: priority === opt.value ? opt.color : '#666',
                           background: priority === opt.value ? `${opt.color}18` : 'transparent',
                        }}
                     >
                        {opt.label}
                     </button>
                  ))}
               </div>
               <textarea
                  className={styles.textarea}
                  value={description}
                  placeholder='Description (optional)'
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
               />
               <div className={styles.deadlineRow}>
                  <label className={styles.deadlineLabel}>Deadline</label>
                  <input
                     className={styles.deadlineInput}
                     type="datetime-local"
                     value={deadline}
                     onChange={e => setDeadline(e.target.value)}
                  />
               </div>
            </div>
         )}
      </div>
   );
};