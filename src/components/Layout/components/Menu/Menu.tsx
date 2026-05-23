import { NavLink } from 'react-router-dom';
import styles from './menu.module.css';
import { loadFromLocalStorage, removeKeyFromLocalStorage } from '../../../../utils';

const NAV_ITEMS = [
   { path: (id: string) => `/user/${id}/todos`,    label: 'Todos',    icon: '✓', end: false },
   { path: (id: string) => `/user/${id}/`,          label: 'Profile',  icon: '◉', end: true  },
   { path: (id: string) => `/user/${id}/history`,   label: 'History',  icon: '◷', end: false },
   { path: (id: string) => `/user/${id}/calendar`,  label: 'Calendar', icon: '▦', end: false },
   { path: (id: string) => `/user/${id}/settings`,  label: 'Settings', icon: '⚙', end: false },
] as const;

export const Menu = () => {
   const id = loadFromLocalStorage<string>('user');

   return (
      <nav className={styles.nav}>

         {/* ── Top: brand + links ── */}
         <div className={styles.top}>
            <div className={styles.brand}>
               <div className={styles.brandIcon}>✓</div>
               <span className={styles.brandName}>Tasks</span>
            </div>

            <ul className={styles.list}>
               {NAV_ITEMS.map(item => (
                  <li key={item.label}>
                     <NavLink
                        to={item.path(id ?? '')}
                        end={item.end}
                        className={({ isActive }) =>
                           `${styles.item} ${isActive ? styles.active : ''}`
                        }
                     >
                        <span className={styles.icon}>{item.icon}</span>
                        {item.label}
                     </NavLink>
                  </li>
               ))}
            </ul>
         </div>

         {/* ── Bottom: logout ── */}
         <div className={styles.bottom}>
            <div className={styles.sep} />
            <NavLink
               to="/login/"
               onClick={() => removeKeyFromLocalStorage('user')}
               className={styles.logout}
            >
               <span className={styles.icon}>↪</span>
               Log out
            </NavLink>
         </div>

      </nav>
   );
};
