import React, { useState } from 'react';
import styles from './todo.module.css';
import { useDelTodoMutation, useUpdateTodoMutation } from '../../redux';

export const TodoItem = ({ index = '', todo }) => {
   const [isEdit, setIsEdit] = useState(false);
   const [inputTitle, setInputTitle] = useState(todo.title);
   const [checkBox, setCheckBox] = useState(todo.completed);

   const [updateTodo] = useUpdateTodoMutation();
   const [delTodo] = useDelTodoMutation();

   const onChangeHandler = () => {
      setIsEdit(!isEdit);

      if (inputTitle !== todo.title) {
         const newTodo = {
            ...todo,
            title: inputTitle
         }

         updateTodo(newTodo).unwrap();
      }
   }

   const onDelHandler = () => {
      delTodo(todo.id);
   }

   const checkBoxHandler = () => {
      setCheckBox(!checkBox);

      const newTodo = {
         ...todo,
         completed: !todo.completed
      }

      updateTodo(newTodo).unwrap();
   }

   return (
      <li className={styles.todoItem}>

         <div className={styles.leftPart}>
            <span className={styles.todoIndex}>{index + 1}</span>

            {
               !isEdit
                  ? <p className={styles.todoTitle}>{todo.title}</p>
                  : <input
                     type="text"
                     value={inputTitle}
                     onChange={(e) => setInputTitle(e.target.value)}
                     className={styles.todoInput}
                  />
            }
         </div>

         <div className={styles.todoButtons}>
            <input
               className={styles.todoCheckbox}
               type="checkbox"
               checked={checkBox}
               onChange={checkBoxHandler}
               id={`checkbox-${index}`}
            />
            <label
               className={styles.customCheckbox}
               htmlFor={`checkbox-${index}`}
            ></label>

            <button onClick={onChangeHandler} className={styles.btn}>&#9998;</button>
            <button onClick={onDelHandler} className={`${styles.btn} ${styles.delBtn}`}>&#10539;</button>
         </div>
      </li>
   );
};
