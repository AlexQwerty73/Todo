import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery, useUpdateUserMutation } from '../../redux';
import { User } from '../../redux/usersApi';
import styles from './UserDataEditMode.module.css';

type UserFormData = Omit<User, 'id'>;

export const UserDataEditMode = () => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { data: user, isLoading } = useGetUsersQuery(id ? String(id) : undefined);
   const [updateUser] = useUpdateUserMutation();

   const [userData, setUserData] = useState<UserFormData>({
      name: '',
      email: '',
      phone: '',
      password: '',
   });

   const onChangeHandler = (item: keyof UserFormData, value: string) => {
      setUserData({
         ...userData,
         [item]: value,
      });
   };

   const onClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      navigate(-1);
      updateUser({ id: String(id), ...userData });
   };

   useEffect(() => {
      if (!isLoading && user && !Array.isArray(user)) {
         setUserData(user);
      }
   }, [isLoading, user]);

   return (
      !isLoading
         ? (
            <form className={`${styles.editForm} ${isLoading ? styles.loading : ''}`}>
               <input type="text" placeholder="Name" value={userData.name} onChange={e => onChangeHandler('name', e.target.value)} />
               <input type="email" placeholder="Email" value={userData.email} onChange={e => onChangeHandler('email', e.target.value)} />
               <input type="tel" placeholder="Phone" value={userData.phone} onChange={e => onChangeHandler('phone', e.target.value)} />
               <input type="password" placeholder="Password" value={userData.password} onChange={e => onChangeHandler('password', e.target.value)} />

               <button onClick={onClickHandler}>Save</button>
            </form>
         )
         : 'loading...'
   );
};