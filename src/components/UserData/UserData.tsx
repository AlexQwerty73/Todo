import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery } from '../../redux';
import { User } from '../../redux/usersApi';
import styles from './userPage.module.css';

interface UserDataProps {
   editMode?: boolean;
}

export const UserData = ({ editMode }: UserDataProps) => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { data, isLoading } = useGetUsersQuery(id);

   const user = !Array.isArray(data) ? data as User : null;
   const [showPassword, setShowPassword] = useState(false);

   return (
      <div>
         <div className={`${styles.userData} ${isLoading ? styles.loading : ''}`}>
            <h3>User Name: {user?.name ?? 'loading...'}</h3>
            <h3>Email: {user?.email ?? 'loading...'}</h3>
            <h3>Phone: {user?.phone ?? 'loading...'}</h3>
            <h3>Password: {showPassword ? user?.password ?? 'loading...' : '********'}</h3>
            <div className={styles.btns}>
               <button
                  className={`${styles.actionButton} ${styles.primary}`}
                  onClick={() => setShowPassword(!showPassword)}
               >
                  {showPassword ? 'hide' : 'show'} password
               </button>
               <button
                  className={`${styles.actionButton} ${styles.secondary}`}
                  onClick={() => navigate('edit')}
               >
                  Edit
               </button>
            </div>
         </div>
      </div>
   );
};