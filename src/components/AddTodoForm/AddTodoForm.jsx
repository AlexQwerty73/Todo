import React, { useState } from 'react';
import styles from './addTodoForm.module.css'; 
import { useAddTodoMutation } from '../../redux';
import { loadFromLocalStorage } from '../../utils';

export const AddTodoForm = () => {
   const [title, setTitle] = useState('');
   const [addTodo] = useAddTodoMutation();

   const onclickHandler = () =>{
      const userId = loadFromLocalStorage('user');

      const newTodo = {
         userId,
         title,
         completed:false,
      }

      addTodo(newTodo).unwrap();
      setTitle('');
   }

   return (
      <div className={styles.addTodoForm}>
         <input className={styles.inputAdd} value={title} placeholder='TODO TITLE' type="text" onChange={e => setTitle(e.target.value)} />
         <button onClick={onclickHandler} className={styles.btn}>Add</button>
      </div>
   );
};
