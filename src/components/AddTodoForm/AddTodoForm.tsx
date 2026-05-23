import { useState } from 'react';
import styles from './addTodoForm.module.css';
import { useAddTodoMutation, useAddHistoryMutation } from '../../redux';
import { loadFromLocalStorage, loadSettings } from '../../utils';
import { useToast } from '../../context/ToastContext';
import { Priority, Recurrence } from '../../redux/todosApi';
import { RecurrencePicker } from '../RecurrencePicker';
import { TagPicker } from '../TagPicker';

const priorityOptions: { value: Priority; label: string; color: string }[] = [
   { value: 'high',   label: '↑ High',   color: '#f07070' },
   { value: 'medium', label: '→ Medium', color: '#e0a060' },
   { value: 'low',    label: '↓ Low',    color: '#4caf7d' },
];

export const AddTodoForm = () => {
   const userId = loadFromLocalStorage<string>('user') ?? '';

   const [title,      setTitle]      = useState('');
   const [description,setDescription]= useState('');
   const [deadline,   setDeadline]   = useState('');
   const [priority,   setPriority]   = useState<Priority>(() => loadSettings(userId).defaultPriority);
   const [recurrence, setRecurrence] = useState<Recurrence | undefined>(undefined);
   const [tags,       setTags]       = useState<string[]>([]);
   const [expanded,   setExpanded]   = useState(false);

   const [addTodo]    = useAddTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const handleAdd = () => {
      if (!userId || !title.trim()) return;

      addTodo({
         userId,
         title:       title.trim(),
         completed:   false,
         description: description.trim(),
         deadline:    deadline || undefined,
         priority,
         recurrence,
         tags,
         order:       Date.now(),
         createdAt:   new Date().toISOString(),
      }).unwrap();

      addHistory({
         userId,
         action:    'added',
         title:     title.trim(),
         timestamp: new Date().toISOString(),
      });

      showToast('Task added ✓');
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority(loadSettings(userId).defaultPriority);
      setRecurrence(undefined);
      setTags([]);
      setExpanded(false);
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd();
   };

   return (
      <div className={styles.wrapper}>

         {/* ── Строка ввода ── */}
         <div className={styles.addTodoForm}>
            <input
               className={styles.inputAdd}
               value={title}
               placeholder="What needs to be done?"
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

         {/* ── Панель деталей ── */}
         {expanded && (
            <div className={styles.details}>

               {/* Приоритет */}
               <div className={styles.priorityRow}>
                  {priorityOptions.map(opt => (
                     <button
                        key={opt.value}
                        onClick={() => setPriority(opt.value)}
                        className={styles.priorityBtn}
                        style={{
                           borderColor: priority === opt.value ? opt.color : '#2a2a2e',
                           color:       priority === opt.value ? opt.color : '#555',
                           background:  priority === opt.value ? `${opt.color}18` : 'transparent',
                        }}
                     >
                        {opt.label}
                     </button>
                  ))}
               </div>

               <div className={styles.divider} />

               {/* Описание */}
               <textarea
                  className={styles.textarea}
                  value={description}
                  placeholder="Description (optional)"
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
               />

               {/* Дедлайн */}
               <div className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>Deadline</label>
                  <input
                     className={styles.deadlineInput}
                     type="datetime-local"
                     value={deadline}
                     onChange={e => setDeadline(e.target.value)}
                  />
               </div>

               {/* Теги */}
               <div className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>Tags</label>
                  <TagPicker value={tags} onChange={setTags} />
               </div>

               {/* Повтор */}
               <div className={styles.fieldRow}>
                  <label className={styles.fieldLabel}>Repeat</label>
                  <RecurrencePicker value={recurrence} onChange={setRecurrence} />
               </div>

            </div>
         )}
      </div>
   );
};
