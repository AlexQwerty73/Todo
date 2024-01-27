import React, { useState } from 'react';
import styles from './registrationForm.module.css';
import { useAddUserMutation } from '../../redux/usersApi';
import { useNavigate } from 'react-router-dom';
import { LabelEmail, LabelName, LabelPassword, LabelPhone } from './components';
import { saveToLocalStorage, loadFromLocalStorage } from '../../utils/'

export const RegistrationForm = () => {
   const [addUser] = useAddUserMutation();
   const navigate = useNavigate();

   const [userData, setUserData] = useState({
      name: '',
      email: '',
      phone: '',
      password: ''
   });

   const handleChange = (e) => {
      const { name, value } = e.target;
      setUserData((prevData) => ({
         ...prevData,
         [name]: value
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const { id } = await addUser(userData).unwrap();
         navigate(`/user/${id}`);
         saveToLocalStorage('user', `${id}`);
      } catch (error) {
         console.error('Error during registration:', error);
      }
   };

   return (
      <div className={styles.formContainer}>
         <form onSubmit={handleSubmit}>

            <LabelName styles={styles} userData={userData} handleChange={handleChange} />
            <LabelEmail styles={styles} userData={userData} handleChange={handleChange} />
            <LabelPhone styles={styles} userData={userData} handleChange={handleChange} />
            <LabelPassword styles={styles} userData={userData} handleChange={handleChange} />

            <button type="submit" className={styles.formButton}>
               Create
            </button>
         </form>
      </div>
   );
};
