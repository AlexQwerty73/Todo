import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import { useUserByEmail } from '../../hooks';
import { saveToLocalStorage } from '../../utils';

export const LoginForm = () => {
   const navigate = useNavigate();

   const [formData, setFormData] = useState({
      email: '',
      password: '',
   });

   const userData = useUserByEmail(formData.email);


   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
         ...prevData,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         if (formData.password === userData.password) {
            saveToLocalStorage('user', `${userData.id}`);
            navigate(`/user/${userData.id}`)
         } else {
            console.log('Invalid email or password');
         }
      } catch (error) {
         console.error('Error during login:', error);
      }
   };

   const handleCreate = () => {
      navigate('/user/create');
   };

   return (
      <div className={styles.loginForm}>
         <h2>Login</h2>
         <form onSubmit={handleSubmit}>

            <label>
               Email:
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
               />
            </label>

            <label>
               Password:
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
               />
            </label>

            <div className={styles.btns}>
               <button type="submit">Log In</button>
               <button type="button" onClick={handleCreate}>Create</button>
            </div>
         </form>
      </div>
   );
};
