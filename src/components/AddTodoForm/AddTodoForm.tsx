import { useState } from 'react';
import styles from './addTodoForm.module.css';
import { useAddTodoMutation, useAddHistoryMutation } from '../../redux';
import { loadFromLocalStorage } from '../../utils';
import { useToast } from '../../context/ToastContext';

export const AddTodoForm = () => {
   const [title, setTitle] = useState('');
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
      }).unwrap();

      addHistory({
         userId,
         action: 'added',
         title: title.trim(),
         timestamp: new Date().toISOString(),
      });

      showToast('Task added');
      setTitle('');
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleAdd();
   };

   return (
      <div className={styles.addTodoForm}>
         <input
            className={styles.inputAdd}
            value={title}
            placeholder='TODO TITLE'
            type="text"
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
         />
         <button onClick={handleAdd} className={styles.btn}>Add</button>
      </div>
   );
};