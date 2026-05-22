import { useState } from 'react';
import styles from './registrationForm.module.css';
import { useAddUserMutation } from '../../redux/usersApi';
import { useNavigate } from 'react-router-dom';
import { LabelEmail, LabelName, LabelPassword, LabelPhone } from './components';
import { saveToLocalStorage } from '../../utils/';
import { AddUserBody } from '../../redux/usersApi';

export const RegistrationForm = () => {
   const [addUser] = useAddUserMutation();
   const navigate = useNavigate();

   const [userData, setUserData] = useState<AddUserBody>({
      name: '',
      email: '',
      phone: '',
      password: '',
   });

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setUserData((prevData) => ({
         ...prevData,
         [name]: value,
      }));
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         const { id } = await addUser(userData).unwrap();
         navigate(`/user/${id}`);
         saveToLocalStorage('user', String(id));
      } catch (error) {
         console.error('Error during registration:', error);
      }
   };

   return (
      <div className={styles.formContainer}>
         <h2 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '20px', color: '#e0e0e0' }}>
            Create account
         </h2>
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