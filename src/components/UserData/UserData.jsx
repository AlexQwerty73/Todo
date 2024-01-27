import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery } from '../../redux';
import styles from './userPage.module.css';
//dekompozicija
export const UserData = () => {
   const navigate = useNavigate();
   const { id } = useParams();
   const { data: user = [], isLoading } = useGetUsersQuery(id);

   const [checkbox, setCheckbox] = useState(false);

   return (
      <div>
         <div className={`${styles.userData} ${isLoading ? styles.loading : ''}`}>
            <h3>User Name: {user?.name || 'loading...'}</h3>
            <h3>Email: {user?.email || 'loading...'}</h3>
            <h3>Phone: {user?.phone || 'loading...'}</h3>
            <h3>Password: {checkbox ? user?.password || 'loading...' : '********'} </h3>
            <div className={styles.btns}>
               <button className={`${styles.actionButton} ${styles.primary}`} onClick={() => setCheckbox(!checkbox)}>
                  {!checkbox ? 'show' : 'hide'} password
               </button>
               <button onClick={e => navigate('edit')} className={`${styles.actionButton} ${styles.secondary}`}>Edit</button>
            </div>
         </div>
      </div>
   );
};
