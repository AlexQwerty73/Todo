import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import { useUserByEmail } from '../../hooks';
import { saveToLocalStorage } from '../../utils';

export const LoginForm = () => {
   const navigate = useNavigate();

   const [email,    setEmail]    = useState('');
   const [password, setPassword] = useState('');
   const [showPass, setShowPass] = useState(false);
   const [error,    setError]    = useState('');

   const userData = useUserByEmail(email);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!userData || password !== userData.password) {
         setError('Invalid email or password');
         return;
      }
      saveToLocalStorage('user', String(userData.id));
      navigate(`/user/${userData.id}`);
   };

   return (
      <>
         <div className={styles.glow} />

         <div className={styles.card}>
            {/* Бренд */}
            <div className={styles.brand}>
               <div className={styles.brandIcon}>✓</div>
               <span className={styles.brandName}>Tasks</span>
            </div>

            <h1 className={styles.heading}>Welcome back</h1>
            <p className={styles.subtext}>Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
               <div className={styles.fields}>

                  {/* Email */}
                  <div className={styles.field}>
                     <label className={styles.label}>Email</label>
                     <input
                        type="email"
                        className={`${styles.input} ${error ? styles.inputError : ''}`}
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        autoComplete="email"
                     />
                  </div>

                  {/* Password */}
                  <div className={styles.field}>
                     <label className={styles.label}>Password</label>
                     <div className={styles.inputWrap}>
                        <input
                           type={showPass ? 'text' : 'password'}
                           className={`${styles.input} ${styles.inputWithBtn} ${error ? styles.inputError : ''}`}
                           placeholder="Your password"
                           value={password}
                           onChange={e => { setPassword(e.target.value); setError(''); }}
                           autoComplete="current-password"
                        />
                        <button
                           type="button"
                           className={styles.showPassBtn}
                           onClick={() => setShowPass(p => !p)}
                        >
                           {showPass ? 'Hide' : 'Show'}
                        </button>
                     </div>
                  </div>

               </div>

               {error && <p className={styles.errorMsg}>⚠ {error}</p>}

               <button type="submit" className={styles.submitBtn}>
                  Sign in
               </button>
            </form>

            <div className={styles.divider}>
               <div className={styles.dividerLine} />
               <span className={styles.dividerText}>or</span>
               <div className={styles.dividerLine} />
            </div>

            <p className={styles.footer}>
               Don't have an account?{' '}
               <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => navigate('/user/create')}
               >
                  Create one →
               </button>
            </p>
         </div>
      </>
   );
};
