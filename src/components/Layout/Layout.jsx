import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Menu } from './components/Menu/Menu';
import styles from './styles.module.css';
import { loadFromLocalStorage } from '../../utils';

export const Layout = () => {
   const location = useLocation();
   const navigate = useNavigate();
   const { id } = useParams();
   const useLayout = location.pathname !== '/user/create';

   useEffect(() => {
      const userId = loadFromLocalStorage('user');

      if (!userId || id !== userId && location.pathname !== '/user/create') {
         navigate('/login');
      }

   }, [navigate, location.pathname]);

   return (
      <>
         {useLayout && (
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
