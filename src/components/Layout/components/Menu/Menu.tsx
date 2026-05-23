import { NavLink } from 'react-router-dom';
import styles from './menu.module.css';
import { loadFromLocalStorage, removeKeyFromLocalStorage } from '../../../../utils';

export const Menu = () => {
   const id = loadFromLocalStorage<string>('user');

   return (
      <ul className={styles.list}>
         <li>
            <NavLink
               onClick={() => removeKeyFromLocalStorage('user')}
               to="/login/"
               className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
            >
               Log In
            </NavLink>
         </li>
         <li><NavLink to={`/user/${id}/todos`} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>Todos</NavLink></li>
         <li><NavLink to={`/user/${id}/`} end className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>User</NavLink></li>
         <li><NavLink to={`/user/${id}/history`} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>History</NavLink></li>
         <li><NavLink to={`/user/${id}/calendar`} className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}>Calendar</NavLink></li>
      </ul>
   );
};