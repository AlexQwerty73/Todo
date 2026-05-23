import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import { useUserByEmail } from '../../hooks';
import { saveToLocalStorage } from '../../utils';

interface LoginFormData {
   email: string;
   password: string;
}

export const LoginForm = () => {
   const navigate = useNavigate();

   const [formData, setFormData] = useState<LoginFormData>({
      email: '',
      password: '',
   });
   const [error, setError] = useState('');

   const userData = useUserByEmail(formData.email);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setError('');
      setFormData((prevData) => ({
         ...prevData,
         [name]: value,
      }));
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
         if (!userData || formData.password !== userData.password) {
            setError('Invalid email or password');
            return;
         }
         saveToLocalStorage('user', String(userData.id));
         navigate(`/user/${userData.id}`);
      } catch (err) {
         setError('Something went wrong. Please try again.');
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
                  className={error ? styles.inputError : ''}
               />
            </label>

            <label>
               Password:
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={error ? styles.inputError : ''}
               />
            </label>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.btns}>
               <button type="submit">Log In</button>
               <button type="button" onClick={handleCreate}>Create</button>
            </div>
         </form>
      </div>
   );
};