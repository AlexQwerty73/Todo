import { useState } from 'react';
import styles from './DayModal.module.css';
import { Todo, Subtask, Priority, Recurrence } from '../../redux/todosApi';
import { useDelTodoMutation, useUpdateTodoMutation, useAddTodoMutation, useAddHistoryMutation } from '../../redux';
import { useToast } from '../../context/ToastContext';
import { loadFromLocalStorage, getRecurrenceLabel } from '../../utils';
import { RecurrencePicker } from '../../components/RecurrencePicker';
import { TagPicker, getTagColor } from '../../components/TagPicker';

interface DayModalProps {
   date: Date;
   todos: Todo[];
   onClose: () => void;
}

const toDatetimeLocal = (date: Date) => {
   const pad = (n: number) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00`;
};

const generateId = () => crypto.randomUUID();

const priorityColors: Record<Priority, string> = {
   high: '#f07070',
   medium: '#e0a060',
   low: '#4caf7d',
};

export const DayModal = ({ date, todos, onClose }: DayModalProps) => {
   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();
   const [addTodo] = useAddTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const userId = loadFromLocalStorage<string>('user') ?? '';

   const [showAdd, setShowAdd] = useState(false);
   const [newTitle, setNewTitle] = useState('');
   const [newDesc, setNewDesc] = useState('');
   const [newDeadline, setNewDeadline] = useState(toDatetimeLocal(date));
   const [newPriority, setNewPriority] = useState<Priority>('medium');
   const [newRecurrence, setNewRecurrence] = useState<Recurrence | undefined>(undefined);
   const [newTags, setNewTags] = useState<string[]>([]);

   const [editingId, setEditingId] = useState<string | null>(null);
   const [editTitle, setEditTitle] = useState('');
   const [editDesc, setEditDesc] = useState('');
   const [editDeadline, setEditDeadline] = useState('');
   const [editPriority, setEditPriority] = useState<Priority>('medium');
   const [editRecurrence, setEditRecurrence] = useState<Recurrence | undefined>(undefined);
   const [editTags, setEditTags] = useState<string[]>([]);

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
         priority: newPriority,
         subtasks: [],
         recurrence: newRecurrence,
         tags: newTags,
         order: Date.now(),
         createdAt: new Date().toISOString(),
      }).unwrap();
      addHistory({ userId, action: 'added', title: newTitle.trim(), timestamp: new Date().toISOString() });
      showToast('Task added');
      setNewTitle('');
      setNewDesc('');
      setNewDeadline(toDatetimeLocal(date));
      setNewPriority('medium');
      setNewRecurrence(undefined);
      setNewTags([]);
      setShowAdd(false);
   };

   const startEdit = (todo: Todo) => {
      setEditingId(todo.id);
      setEditTitle(todo.title);
      setEditDesc(todo.description ?? '');
      setEditDeadline(todo.deadline ?? '');
      setEditPriority(todo.priority ?? 'medium');
      setEditRecurrence(todo.recurrence);
      setEditTags(todo.tags ?? []);
   };

   const handleSave = (todo: Todo) => {
      updateTodo({ ...todo, title: editTitle, description: editDesc, deadline: editDeadline || undefined, priority: editPriority, recurrence: editRecurrence, tags: editTags }).unwrap();
      addHistory({ userId, action: 'updated', title: editTitle, timestamp: new Date().toISOString() });
      showToast('Task updated');
      setEditingId(null);
   };

   // Subtask helpers
   const saveSubtasks = (todo: Todo, updated: Subtask[]) => {
      updateTodo({ ...todo, subtasks: updated });
   };

   const toggleSubtask = (todo: Todo, subId: string) => {
      const updated = (todo.subtasks ?? []).map(s =>
         s.id === subId ? { ...s, completed: !s.completed } : s
      );
      saveSubtasks(todo, updated);
   };

   const deleteSubtask = (todo: Todo, subId: string) => {
      saveSubtasks(todo, (todo.subtasks ?? []).filter(s => s.id !== subId));
   };

   const addSubtask = (todo: Todo, title: string) => {
      if (!title.trim()) return;
      const updated = [...(todo.subtasks ?? []), { id: generateId(), title: title.trim(), completed: false }];
      saveSubtasks(todo, updated);
   };

   const completedCount = todos.filter(t => t.completed).length;

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={e => e.stopPropagation()}>

            {/* ── Заголовок ── */}
            <div className={styles.modalHeader}>
               <div>
                  <h3 className={styles.modalTitle}>{formatted}</h3>
                  {todos.length > 0 && (
                     <p className={styles.modalSubtitle}>
                        {completedCount} of {todos.length} completed
                     </p>
                  )}
               </div>
               <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            {/* ── Скролл-область ── */}
            <div className={styles.body}>

            <ul className={styles.list}>
               {todos.length === 0 && !showAdd && (
                  <div className={styles.empty}>
                     <span className={styles.emptyIcon}>○</span>
                     No tasks this day
                  </div>
               )}
               {todos.map(todo => (
                  <li
                     key={todo.id}
                     className={`${styles.item} ${todo.completed ? styles.itemDone : ''}`}
                     style={{ borderLeft: `2px solid ${priorityColors[todo.priority ?? 'medium']}` }}
                  >
                     {editingId === todo.id ? (
                        <div className={styles.editBlock}>
                           <input className={styles.editInput} value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Title" autoFocus />
                           <div className={styles.priorityRow}>
                              {(['high', 'medium', 'low'] as Priority[]).map(p => (
                                 <button
                                    key={p}
                                    className={styles.priorityBtn}
                                    style={{
                                       borderColor: editPriority === p ? priorityColors[p] : '#2a2a2e',
                                       color: editPriority === p ? priorityColors[p] : '#666',
                                       background: editPriority === p ? `${priorityColors[p]}18` : 'transparent',
                                    }}
                                    onClick={() => setEditPriority(p)}
                                 >{p}</button>
                              ))}
                           </div>
                           <textarea className={styles.editTextarea} value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Description (optional)" rows={2} />
                           <div className={styles.editDeadlineRow}>
                              <label className={styles.editLabel}>Deadline</label>
                              <input type="datetime-local" className={styles.editDeadlineInput} value={editDeadline} onChange={e => setEditDeadline(e.target.value)} />
                           </div>
                           <div className={styles.editDeadlineRow}>
                              <label className={styles.editLabel}>Tags</label>
                              <TagPicker value={editTags} onChange={setEditTags} />
                           </div>
                           <div className={styles.editDeadlineRow}>
                              <label className={styles.editLabel}>Repeat</label>
                              <RecurrencePicker value={editRecurrence} onChange={setEditRecurrence} />
                           </div>
                           <div className={styles.editActions}>
                              <button className={styles.saveBtn} onClick={() => handleSave(todo)}>Save</button>
                              <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                           </div>
                        </div>
                     ) : (
                        <>
                           <div className={styles.itemLeft}>
                              <button className={`${styles.check} ${todo.completed ? styles.checkDone : ''}`} onClick={() => toggleComplete(todo)} />
                              <div className={styles.itemInfo}>
                                 <span className={styles.itemTitle}>{todo.title}</span>
                                 {todo.description && <span className={styles.itemDesc}>{todo.description}</span>}
                                 {todo.deadline && (
                                    <span className={styles.itemTime}>
                                       {new Date(todo.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                 )}
                                 {todo.recurrence && (
                                    <span className={styles.recurrenceBadge}>
                                       🔁 {getRecurrenceLabel(todo.recurrence)}
                                    </span>
                                 )}
                                 {(todo.tags ?? []).length > 0 && (
                                    <div className={styles.tagsRow}>
                                       {todo.tags!.map(tag => (
                                          <span key={tag} className={styles.tagChip}
                                             style={{ borderColor: getTagColor(tag), color: getTagColor(tag) }}>
                                             {tag}
                                          </span>
                                       ))}
                                    </div>
                                 )}

                                 {/* Subtasks */}
                                 {(todo.subtasks ?? []).length > 0 && (
                                    <div className={styles.subtasksBlock}>
                                       <div className={styles.subtasksHeader}>
                                          <span className={styles.subtasksProgress}>
                                             {(todo.subtasks ?? []).filter(s => s.completed).length}/{(todo.subtasks ?? []).length} subtasks
                                          </span>
                                          <div className={styles.subtasksBar}>
                                             <div className={styles.subtasksFill} style={{
                                                width: `${((todo.subtasks ?? []).filter(s => s.completed).length / (todo.subtasks ?? []).length) * 100}%`
                                             }} />
                                          </div>
                                       </div>
                                       <ul className={styles.subtasksList}>
                                          {(todo.subtasks ?? []).map(s => (
                                             <li key={s.id} className={styles.subtaskItem}>
                                                <button
                                                   className={`${styles.subtaskCheck} ${s.completed ? styles.subtaskCheckDone : ''}`}
                                                   onClick={() => toggleSubtask(todo, s.id)}
                                                />
                                                <span className={`${styles.subtaskLabel} ${s.completed ? styles.subtaskDone : ''}`}>{s.title}</span>
                                                <button className={styles.subtaskDel} onClick={() => deleteSubtask(todo, s.id)}>✕</button>
                                             </li>
                                          ))}
                                       </ul>
                                    </div>
                                 )}

                                 {/* Add subtask */}
                                 <SubtaskInput onAdd={(title) => addSubtask(todo, title)} />
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
                  <input className={styles.editInput} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task title" autoFocus />
                  <div className={styles.priorityRow}>
                     {(['high', 'medium', 'low'] as Priority[]).map(p => (
                        <button
                           key={p}
                           className={styles.priorityBtn}
                           style={{
                              borderColor: newPriority === p ? priorityColors[p] : '#2a2a2e',
                              color: newPriority === p ? priorityColors[p] : '#666',
                              background: newPriority === p ? `${priorityColors[p]}18` : 'transparent',
                           }}
                           onClick={() => setNewPriority(p)}
                        >{p}</button>
                     ))}
                  </div>
                  <textarea className={styles.editTextarea} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" rows={2} />
                  <div className={styles.editDeadlineRow}>
                     <label className={styles.editLabel}>Deadline</label>
                     <input type="datetime-local" className={styles.editDeadlineInput} value={newDeadline} onChange={e => setNewDeadline(e.target.value)} />
                  </div>
                  <div className={styles.editDeadlineRow}>
                     <label className={styles.editLabel}>Tags</label>
                     <TagPicker value={newTags} onChange={setNewTags} />
                  </div>
                  <div className={styles.editDeadlineRow}>
                     <label className={styles.editLabel}>Repeat</label>
                     <RecurrencePicker value={newRecurrence} onChange={setNewRecurrence} />
                  </div>
                  <div className={styles.editActions}>
                     <button className={styles.saveBtn} onClick={handleAdd}>Add task</button>
                     <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                  </div>
               </div>
            )}

            </div>{/* /body */}

            {!showAdd && (
               <div className={styles.footer}>
                  <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add task</button>
               </div>
            )}
         </div>
      </div>
   );
};

const SubtaskInput = ({ onAdd }: { onAdd: (title: string) => void }) => {
   const [value, setValue] = useState('');
   return (
      <div className={styles.addSubtaskRow}>
         <input
            className={styles.addSubtaskInput}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && value.trim()) { onAdd(value); setValue(''); } }}
            placeholder="+ Add subtask"
         />
         {value && (
            <button className={styles.addSubtaskBtn} onClick={() => { onAdd(value); setValue(''); }}>Add</button>
         )}
      </div>
   );
};