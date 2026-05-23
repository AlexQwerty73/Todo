import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './registrationForm.module.css';
import { useAddUserMutation } from '../../redux/usersApi';
import { saveToLocalStorage } from '../../utils';

export const RegistrationForm = () => {
   const [addUser]  = useAddUserMutation();
   const navigate   = useNavigate();

   const [name,     setName]     = useState('');
   const [email,    setEmail]    = useState('');
   const [phone,    setPhone]    = useState('');
   const [password, setPassword] = useState('');
   const [showPass, setShowPass] = useState(false);
   const [error,    setError]    = useState('');

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim())     { setError('Name is required');     return; }
      if (!email.trim())    { setError('Email is required');    return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

      try {
         const { id } = await addUser({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
         }).unwrap();
         saveToLocalStorage('user', String(id));
         navigate(`/user/${id}`);
      } catch {
         setError('Something went wrong. Please try again.');
      }
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

            <h1 className={styles.heading}>Create account</h1>
            <p className={styles.subtext}>Start organising your tasks today</p>

            <form onSubmit={handleSubmit}>
               <div className={styles.fields}>

                  {/* Имя */}
                  <div className={styles.field}>
                     <label className={styles.label}>Full name</label>
                     <input
                        type="text"
                        className={styles.input}
                        placeholder="Alex Johnson"
                        value={name}
                        onChange={e => { setName(e.target.value); setError(''); }}
                        autoComplete="name"
                     />
                  </div>

                  {/* Email */}
                  <div className={styles.field}>
                     <label className={styles.label}>Email</label>
                     <input
                        type="email"
                        className={styles.input}
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        autoComplete="email"
                     />
                  </div>

                  {/* Телефон */}
                  <div className={styles.field}>
                     <label className={styles.label}>
                        Phone
                        <span className={styles.optional}>optional</span>
                     </label>
                     <input
                        type="tel"
                        className={styles.input}
                        placeholder="+1 234 567 890"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        autoComplete="tel"
                     />
                  </div>

                  {/* Пароль */}
                  <div className={styles.field}>
                     <label className={styles.label}>Password</label>
                     <div className={styles.inputWrap}>
                        <input
                           type={showPass ? 'text' : 'password'}
                           className={`${styles.input} ${styles.inputWithBtn}`}
                           placeholder="Min 6 characters"
                           value={password}
                           onChange={e => { setPassword(e.target.value); setError(''); }}
                           autoComplete="new-password"
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
                  Create account
               </button>
            </form>

            <div className={styles.divider}>
               <div className={styles.dividerLine} />
               <span className={styles.dividerText}>or</span>
               <div className={styles.dividerLine} />
            </div>

            <p className={styles.footer}>
               Already have an account?{' '}
               <button
                  type="button"
                  className={styles.footerLink}
                  onClick={() => navigate('/login')}
               >
                  Sign in →
               </button>
            </p>
         </div>
      </>
   );
};
