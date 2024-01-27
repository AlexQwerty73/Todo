import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery, useUpdateUserMutation } from '../../redux';
import styles from './UserDataEditMode.module.css';

export const UserDataEditMode = () => {
   const navigate = useNavigate();
   const { id } = useParams();
   const { data: user = [], isLoading } = useGetUsersQuery(id);
   const [updateUser] = useUpdateUserMutation();

   const [userData, setUserData] = useState({
      name: '',
      email: '',
      phone: '',
      password: ''
   });

   const onChangeHandler = (item, value) => {
      setUserData({
         ...userData,
         [item]: value,
      });
   }

   const onClickHandler = (e) => {
      e.preventDefault();
      navigate(-1);
      updateUser(userData);
   }

   useEffect(() => {
      if (!isLoading && user) {
         setUserData(user);
      }
   }, [isLoading, user]);

   return (
      !isLoading
         ? (
            <form className={`${styles.editForm} ${isLoading ? styles.loading : ''}`}>
               <input type="text" value={userData.name} onChange={e => onChangeHandler('name', e.target.value)} />
               <input type="text" value={userData.email} onChange={e => onChangeHandler('email', e.target.value)} />
               <input type="text" value={userData.phone} onChange={e => onChangeHandler('phone', e.target.value)} />
               <input type="text" value={userData.password} onChange={e => onChangeHandler('password', e.target.value)} />

               <button onClick={e => onClickHandler(e)}>Save</button>
            </form>
         )
         : 'loading...'
   );
};
