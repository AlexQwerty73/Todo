import { useState } from 'react';
import styles from './todo.module.css';
import { useDelTodoMutation, useUpdateTodoMutation, useAddHistoryMutation } from '../../redux';
import { Todo } from '../../redux/todosApi';
import { useToast } from '../../context/ToastContext';
import { loadFromLocalStorage } from '../../utils';

interface TodoItemProps {
   index: number;
   todo: Todo;
}

export const TodoItem = ({ index, todo }: TodoItemProps) => {
   const [isEdit, setIsEdit] = useState(false);
   const [inputTitle, setInputTitle] = useState(todo.title);
   const [checkBox, setCheckBox] = useState(todo.completed);
   const [removing, setRemoving] = useState(false);

   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();
   const [addHistory] = useAddHistoryMutation();
   const { showToast } = useToast();

   const userId = loadFromLocalStorage<string>('user') ?? '';

   const isOverdue = todo.deadline && !todo.completed
      && new Date(todo.deadline) < new Date();

   const formatDeadline = (deadline: string) => {
      const date = new Date(deadline);
      return date.toLocaleString([], {
         day: '2-digit',
         month: '2-digit',
         year: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   };

   const logHistory = (action: 'added' | 'deleted' | 'completed' | 'reopened' | 'updated', title: string) => {
      addHistory({ userId, action, title, timestamp: new Date().toISOString() });
   };

   const onChangeHandler = () => {
      setIsEdit(!isEdit);
      if (inputTitle !== todo.title) {
         updateTodo({ ...todo, title: inputTitle }).unwrap();
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
      const newCompleted = !checkBox;
      setCheckBox(newCompleted);
      updateTodo({ ...todo, completed: newCompleted }).unwrap();
      logHistory(newCompleted ? 'completed' : 'reopened', todo.title);
      showToast(newCompleted ? 'Task completed! ✓' : 'Task reopened');
   };

   return (
      <li className={`${styles.todoItem} ${removing ? styles.removing : ''} ${isOverdue ? styles.overdue : ''}`}>
         <div className={styles.leftPart}>
            <span className={styles.todoIndex}>{index + 1}</span>
            <div className={styles.titleBlock}>
               {!isEdit
                  ? <p className={`${styles.todoTitle} ${checkBox ? styles.completed : ''}`}>
                     {todo.title}
                  </p>
                  : <input
                     type="text"
                     value={inputTitle}
                     onChange={(e) => setInputTitle(e.target.value)}
                     className={styles.todoInput}
                     autoFocus
                  />
               }
               {todo.deadline && (
                  <span className={`${styles.deadline} ${isOverdue ? styles.deadlineOverdue : ''}`}>
                     ⏱ {formatDeadline(todo.deadline)}
                  </span>
               )}
               {todo.description && (
                  <span className={styles.description}>{todo.description}</span>
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
            <button onClick={onChangeHandler} className={styles.btn}>&#9998;</button>
            <button onClick={onDelHandler} className={`${styles.btn} ${styles.delBtn}`}>&#9839;</button>
         </div>
      </li>
   );
};