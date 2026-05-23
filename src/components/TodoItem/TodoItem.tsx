import { useState } from 'react';
import styles from './todo.module.css';
import { useDelTodoMutation, useUpdateTodoMutation } from '../../redux';
import { Todo } from '../../redux/todosApi';
import { useToast } from '../../context/ToastContext';

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
   const { showToast } = useToast();

   const onChangeHandler = () => {
      setIsEdit(!isEdit);
      if (inputTitle !== todo.title) {
         updateTodo({ ...todo, title: inputTitle }).unwrap();
         showToast('Task updated');
      }
   };

   const onDelHandler = () => {
      setRemoving(true);
      setTimeout(() => {
         delTodo(todo.id);
         showToast('Task deleted', 'error');
      }, 250);
   };

   const checkBoxHandler = () => {
      setCheckBox(!checkBox);
      updateTodo({ ...todo, completed: !todo.completed }).unwrap();
      showToast(!checkBox ? 'Task completed! ✓' : 'Task reopened');
   };

   return (
      <li className={`${styles.todoItem} ${removing ? styles.removing : ''}`}>
         <div className={styles.leftPart}>
            <span className={styles.todoIndex}>{index + 1}</span>
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