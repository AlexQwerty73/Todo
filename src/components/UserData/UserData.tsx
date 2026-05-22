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
      <div className={styles.userData}>
         <h3>User Name: <span>{user?.name ?? 'loading...'}</span></h3>
         <h3>Email: <span>{user?.email ?? 'loading...'}</span></h3>
         <h3>Phone: <span>{user?.phone ?? 'loading...'}</span></h3>
         <h3>Password: <span>{showPassword ? user?.password ?? 'loading...' : '********'}</span></h3>

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
   );
};