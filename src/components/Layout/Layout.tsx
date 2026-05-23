import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu } from './components/Menu/Menu';
import styles from './styles.module.css';
import { loadFromLocalStorage } from '../../utils';

export const Layout = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const AUTH_PATHS = ['/user/create', '/login'];
   const showLayout = !AUTH_PATHS.includes(location.pathname);

   useEffect(() => {
      const userId = loadFromLocalStorage<string>('user');
      if (AUTH_PATHS.includes(location.pathname)) return;
      if (!userId || id !== userId) navigate('/login');
   }, [navigate, location.pathname]);

   return (
      <>
         {showLayout && (
            <div className={styles.sideBar}>
               <Menu />
            </div>
         )}

         <div className={showLayout ? styles.outLet : styles.authOutlet}>
            <Outlet />
         </div>
      </>
   );
};