import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu } from './components/Menu/Menu';
import styles from './styles.module.css';
import { loadFromLocalStorage } from '../../utils';

export const Layout = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const showLayout = location.pathname !== '/user/create';

   useEffect(() => {
      const userId = loadFromLocalStorage<string>('user');

      if (location.pathname === '/user/create') return;

      if (!userId || id !== userId) {
         navigate('/login');
      }
   }, [navigate, location.pathname]);

   return (
      <>
         {showLayout && (
            <div className={styles.sideBar}>
               <Menu />
            </div>
         )}

         <div className={styles.outLet}>
            <Outlet />
         </div>
      </>
   );
};