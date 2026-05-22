import { useState } from 'react';
import styles from './addTodoForm.module.css';
import { useAddTodoMutation } from '../../redux';
import { loadFromLocalStorage } from '../../utils';

export const AddTodoForm = () => {
   const [title, setTitle] = useState('');
   const [addTodo] = useAddTodoMutation();

   const onClickHandler = () => {
      const userId = loadFromLocalStorage<string>('user');

      if (!userId) {
         console.error('User not found in localStorage');
         return;
      }

      addTodo({
         userId: userId,
         title,
         completed: false,
      }).unwrap();

      setTitle('');
   };

   return (
      <div className={styles.addTodoForm}>
         <input
            className={styles.inputAdd}
            value={title}
            placeholder='TODO TITLE'
            type="text"
            onChange={e => setTitle(e.target.value)}
         />
         <button onClick={onClickHandler} className={styles.btn}>Add</button>
      </div>
   );
};