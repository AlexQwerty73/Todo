import React from 'react';
import { Link } from 'react-router-dom';
import styles from './menu.module.css';
import { loadFromLocalStorage, removeKeyFromLocalStorage } from '../../../../utils';

export const Menu = () => {
   const id = loadFromLocalStorage('user')

   return (
      <ul className={styles.list}>
         <li><Link onClick={() => removeKeyFromLocalStorage('user')} to="/login/" className={styles.item}>Log In</Link></li>
         <li><Link to={`/user/${id}/todos`} className={styles.item}>Todos</Link></li>
         <li><Link to={`/user/${id}/`} className={styles.item}>User</Link></li>
      </ul>
   );
};
