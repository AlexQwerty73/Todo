import { useState, useEffect } from 'react';
import styles from './todo.module.css';
import { useDelTodoMutation, useUpdateTodoMutation, useAddHistoryMutation } from '../../redux';
import { Todo, Priority, Subtask, Recurrence } from '../../redux/todosApi';
import { useToast } from '../../context/ToastContext';
import { loadFromLocalStorage, getRecurrenceLabel, getNextRecurrenceDate } from '../../utils';
import { RecurrencePicker } from '../RecurrencePicker';
import { TagPicker, getTagColor } from '../TagPicker';

interface TodoItemProps {
   index: number;
   todo: Todo;
}

const priorityColors: Record<Priority, string> = {
   high: '#f07070',
   medium: '#e0a060',
   low: '#4caf7d',
};

const priorityOptions: Priority[] = ['high', 'medium', 'low'];

const generateId = () => crypto.randomUUID();

export const TodoItem = ({ index, todo }: TodoItemProps) => {
   const [isEdit, setIsEdit] = useState(false);
   const [inputTitle, setInputTitle] = useState(todo.title);
   const [inputDescription, setInputDescription] = useState(todo.description ?? '');
   const [inputDeadline, setInputDeadline] = useState(todo.deadline ?? '');
   const [inputPriority, setInputPriority] = useState<Priority>(todo.priority ?? 'medium');
   const [inputRecurrence, setInputRecurrence] = useState<Recurrence | undefined>(todo.recurrence);
   const [inputTags, setInputTags] = useState<string[]>(todo.tags ?? []);
   const [subtasks, setSubtasks] = useState<Subtask[]>(todo.subtasks ?? []);
   const [newSubtask, setNewSubtask] = useState('');
   const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
   const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');
   const [checkBox, setCheckBox] = useState(todo.completed);
   const [removing, setRemoving] = useState(false);

   // Синхронизируем локальный стейт с пропсами когда RTK Query перезагружает данные
   useEffect(() => { setSubtasks(todo.subtasks ?? []); }, [todo.subtasks]);
   useEffect(() => { setCheckBox(todo.completed); }, [todo.completed]);
   useEffect(() => { setInputTags(todo.tags ?? []); }, [todo.tags]);

   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const userId = loadFromLocalStorage<string>('user') ?? '';

   const isOverdue = todo.deadline && !todo.completed
      && new Date(todo.deadline) < new Date();

   const formatDeadline = (deadline: string) => {
      return new Date(deadline).toLocaleString([], {
         day: '2-digit', month: '2-digit', year: 'numeric',
         hour: '2-digit', minute: '2-digit',
      });
   };

   const logHistory = (action: 'added' | 'deleted' | 'completed' | 'reopened' | 'updated', title: string) => {
      addHistory({ userId, action, title, timestamp: new Date().toISOString() });
   };

   // Subtask helpers — сохраняют сразу на сервер
   const saveSubtasks = (updated: Subtask[]) => {
      setSubtasks(updated);
      updateTodo({ ...todo, subtasks: updated });
   };

   const addSubtask = () => {
      if (!newSubtask.trim()) return;
      saveSubtasks([...subtasks, { id: generateId(), title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
   };

   const toggleSubtask = (id: string) => {
      saveSubtasks(subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
   };

   const deleteSubtask = (id: string) => {
      saveSubtasks(subtasks.filter(s => s.id !== id));
   };

   const startEditSubtask = (subtask: Subtask) => {
      setEditingSubtaskId(subtask.id);
      setEditingSubtaskTitle(subtask.title);
   };

   const saveEditSubtask = (id: string) => {
      if (!editingSubtaskTitle.trim()) return;
      saveSubtasks(subtasks.map(s => s.id === id ? { ...s, title: editingSubtaskTitle.trim() } : s));
      setEditingSubtaskId(null);
   };

   const openEdit = () => {
      setInputTitle(todo.title);
      setInputDescription(todo.description ?? '');
      setInputDeadline(todo.deadline ?? '');
      setInputPriority(todo.priority ?? 'medium');
      setInputRecurrence(todo.recurrence);
      setInputTags(todo.tags ?? []);
      setIsEdit(true);
   };

   const cancelEdit = () => setIsEdit(false);

   const onSaveHandler = () => {
      setIsEdit(false);
      const changed = inputTitle !== todo.title
         || inputDescription !== (todo.description ?? '')
         || inputDeadline !== (todo.deadline ?? '')
         || inputPriority !== (todo.priority ?? 'medium')
         || JSON.stringify(inputRecurrence) !== JSON.stringify(todo.recurrence)
         || JSON.stringify(inputTags) !== JSON.stringify(todo.tags ?? []);

      if (changed) {
         updateTodo({
            ...todo,
            title: inputTitle,
            description: inputDescription,
            deadline: inputDeadline || undefined,
            priority: inputPriority,
            subtasks,
            recurrence: inputRecurrence,
            tags: inputTags,
         }).unwrap();
         logHistory('updated', inputTitle);
         showToast('Task updated');
      }
   };

   const onDelHandler = () => {
      setRemoving(true);
      setTimeout(() => {
         delTodo(todo.id);
         logHistory('deleted', todo.title);
         showToast('Task deleted', 'error');
      }, 250);
   };

   const checkBoxHandler = () => {
      // ── Recurring task: advance to next occurrence ──────────────────────────
      if (!checkBox && todo.recurrence && todo.deadline) {
         logHistory('completed', todo.title);
         const nextDate = getNextRecurrenceDate(todo.deadline, todo.recurrence);

         if (nextDate) {
            // Advance deadline — do NOT mark completed
            updateTodo({ ...todo, deadline: nextDate }).unwrap();
            const label = new Date(nextDate).toLocaleDateString([], {
               weekday: 'short', day: 'numeric', month: 'short',
            });
            showToast(`✓ Done · next ${label}`);
         } else {
            // End date reached — finish the recurrence permanently
            updateTodo({ ...todo, completed: true, recurrence: undefined }).unwrap();
            showToast('Last recurrence completed! 🎉');
         }
         return;
      }

      // ── Normal task ─────────────────────────────────────────────────────────
      const newCompleted = !checkBox;
      setCheckBox(newCompleted);
      updateTodo({ ...todo, completed: newCompleted }).unwrap();
      logHistory(newCompleted ? 'completed' : 'reopened', todo.title);
      showToast(newCompleted ? 'Task completed! ✓' : 'Task reopened');
   };

   const priorityColor = priorityColors[todo.priority ?? 'medium'];
   const completedSubtasks = subtasks.filter(s => s.completed).length;

   return (
      <li className={[
         styles.todoItem,
         removing    ? styles.removing      : '',
         isOverdue   ? styles.overdue       : '',
         checkBox && !isOverdue ? styles.completedCard : '',
      ].join(' ')}>
         <div className={styles.priorityBar} style={{ background: priorityColor }} />
         <div className={styles.leftPart}>
            <span className={styles.todoIndex}>{index + 1}</span>
            <div className={styles.titleBlock}>
               {!isEdit ? (
                  <>
                     <p className={`${styles.todoTitle} ${checkBox ? styles.completed : ''}`}>
                        {todo.title}
                     </p>
                     {todo.deadline && (
                        <span className={`${styles.deadline} ${isOverdue ? styles.deadlineOverdue : ''}`}>
                           ⏱ {formatDeadline(todo.deadline)}
                        </span>
                     )}
                     {todo.description && (
                        <span className={styles.description}>{todo.description}</span>
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

                     {/* Subtasks view */}
                     {subtasks.length > 0 && (
                        <div className={styles.subtasksBlock}>
                           <div className={styles.subtasksHeader}>
                              <span className={styles.subtasksProgress}>
                                 {completedSubtasks}/{subtasks.length} subtasks
                              </span>
                              <div className={styles.subtasksBar}>
                                 <div
                                    className={styles.subtasksFill}
                                    style={{ width: `${subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0}%` }}
                                 />
                              </div>
                           </div>
                           <ul className={styles.subtasksList}>
                              {subtasks.map(s => (
                                 <li key={s.id} className={styles.subtaskItem}>
                                    <input
                                       type="checkbox"
                                       checked={s.completed}
                                       onChange={() => toggleSubtask(s.id)}
                                       className={styles.subtaskCheckbox}
                                       id={`sub-${s.id}`}
                                    />
                                    <label htmlFor={`sub-${s.id}`} className={styles.subtaskCustomCheck} />
                                    <label
                                       htmlFor={`sub-${s.id}`}
                                       className={`${styles.subtaskLabel} ${s.completed ? styles.subtaskDone : ''}`}
                                    >
                                       {editingSubtaskId === s.id ? (
                                          <input
                                             className={styles.subtaskEditInput}
                                             value={editingSubtaskTitle}
                                             onChange={e => setEditingSubtaskTitle(e.target.value)}
                                             onBlur={() => saveEditSubtask(s.id)}
                                             onKeyDown={e => e.key === 'Enter' && saveEditSubtask(s.id)}
                                             autoFocus
                                             onClick={e => e.preventDefault()}
                                          />
                                       ) : s.title}
                                    </label>
                                    <button className={styles.subtaskAction} onClick={() => startEditSubtask(s)}>✎</button>
                                    <button className={`${styles.subtaskAction} ${styles.subtaskDel}`} onClick={() => deleteSubtask(s.id)}>✕</button>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}

                     {/* Add subtask input */}
                     <div className={styles.addSubtaskRow}>
                        <input
                           className={styles.addSubtaskInput}
                           value={newSubtask}
                           onChange={e => setNewSubtask(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && addSubtask()}
                           placeholder="+ Add subtask"
                        />
                        {newSubtask && (
                           <button className={styles.addSubtaskBtn} onClick={addSubtask}>Add</button>
                        )}
                     </div>
                  </>
               ) : (
                  <div className={styles.editBlock}>
                     <input
                        type="text"
                        value={inputTitle}
                        onChange={e => setInputTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') cancelEdit(); if (e.key === 'Enter') onSaveHandler(); }}
                        className={styles.todoInput}
                        placeholder="Title"
                        autoFocus
                     />
                     <div className={styles.editPriorityRow}>
                        {priorityOptions.map(p => (
                           <button
                              key={p}
                              onClick={() => setInputPriority(p)}
                              className={styles.editPriorityBtn}
                              style={{
                                 borderColor: inputPriority === p ? priorityColors[p] : '#2a2a2e',
                                 color: inputPriority === p ? priorityColors[p] : '#666',
                                 background: inputPriority === p ? `${priorityColors[p]}18` : 'transparent',
                              }}
                           >
                              {p}
                           </button>
                        ))}
                     </div>
                     <textarea
                        value={inputDescription}
                        onChange={e => setInputDescription(e.target.value)}
                        className={styles.editTextarea}
                        placeholder="Description (optional)"
                        rows={2}
                     />
                     <div className={styles.editDeadlineRow}>
                        <label className={styles.editDeadlineLabel}>Deadline</label>
                        <input
                           type="datetime-local"
                           value={inputDeadline}
                           onChange={e => setInputDeadline(e.target.value)}
                           className={styles.editDeadlineInput}
                        />
                     </div>
                     <div className={styles.editDeadlineRow}>
                        <label className={styles.editDeadlineLabel}>Tags</label>
                        <TagPicker value={inputTags} onChange={setInputTags} />
                     </div>
                     <div className={styles.editDeadlineRow}>
                        <label className={styles.editDeadlineLabel}>Repeat</label>
                        <RecurrencePicker value={inputRecurrence} onChange={setInputRecurrence} />
                     </div>
                     <div className={styles.editActions}>
                        <button onClick={onSaveHandler} className={styles.saveBtn}>Save</button>
                        <button onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                     </div>
                  </div>
               )}
            </div>
         </div>
         <div className={styles.todoButtons}>
            <input
               className={styles.todoCheckbox}
               type="checkbox"
               checked={checkBox}
               onChange={checkBoxHandler}
               id={`checkbox-${todo.id}`}
            />
            <label className={styles.customCheckbox} htmlFor={`checkbox-${todo.id}`}></label>
            <button
               onClick={() => isEdit ? cancelEdit() : openEdit()}
               className={`${styles.btn} ${isEdit ? styles.btnActive : ''}`}
            >
               ✎
            </button>
            <button onClick={onDelHandler} className={`${styles.btn} ${styles.delBtn}`}>✕</button>
         </div>
      </li>
   );
};