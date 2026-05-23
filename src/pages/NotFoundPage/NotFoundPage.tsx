import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
   const navigate = useNavigate();

   return (
      <div className={styles.page}>
         <div className={styles.code}>404</div>
         <h1 className={styles.title}>Page not found</h1>
         <p className={styles.desc}>
            The page you're looking for doesn't exist or has been moved.
         </p>
         <div className={styles.actions}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
               ← Go back
            </button>
            <button className={styles.homeBtn} onClick={() => navigate('/login')}>
               Home
            </button>
         </div>
      </div>
   );
};
