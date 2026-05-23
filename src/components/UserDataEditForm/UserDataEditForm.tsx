import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetUsersQuery, useUpdateUserMutation } from '../../redux';
import { User } from '../../redux/usersApi';
import { useToast } from '../../context/ToastContext';
import styles from './UserDataEditMode.module.css';

type UserFormData = Omit<User, 'id'>;

interface Errors {
   name?: string;
   email?: string;
   phone?: string;
   password?: string;
   confirm?: string;
}

const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export const UserDataEditMode = () => {
   const navigate = useNavigate();
   const { id } = useParams<{ id: string }>();
   const { data: user, isLoading } = useGetUsersQuery(id ? String(id) : undefined);
   const [updateUser] = useUpdateUserMutation();
   const { showToast } = useToast();

   const [original, setOriginal] = useState<UserFormData>({ name: '', email: '', phone: '', password: '' });
   const [form, setForm] = useState<UserFormData>({ name: '', email: '', phone: '', password: '' });
   const [confirm, setConfirm] = useState('');
   const [errors, setErrors] = useState<Errors>({});
   const [showPass, setShowPass] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);
   const [touched, setTouched] = useState<Record<string, boolean>>({});

   useEffect(() => {
      if (!isLoading && user && !Array.isArray(user)) {
         setOriginal(user);
         setForm(user);
         setConfirm(user.password);
      }
   }, [isLoading, user]);

   const hasChanges = JSON.stringify(form) !== JSON.stringify(original);

   // ── валидация одного поля ──────────────────────────────────────────────────
   const validateField = (field: string, value: string): string => {
      switch (field) {
         case 'name':
            if (!value.trim()) return 'Name is required';
            if (value.trim().length < 2) return 'At least 2 characters';
            return '';
         case 'email':
            if (!value.trim()) return 'Email is required';
            if (!validateEmail(value)) return 'Invalid email format';
            return '';
         case 'phone':
            if (value && !/^[+\d\s\-()]{6,}$/.test(value)) return 'Invalid phone number';
            return '';
         case 'password':
            if (!value) return 'Password is required';
            if (value.length < 6) return 'At least 6 characters';
            return '';
         case 'confirm':
            if (value !== form.password) return 'Passwords do not match';
            return '';
         default:
            return '';
      }
   };

   const allErrors = (): Errors => ({
      name:     validateField('name',     form.name),
      email:    validateField('email',    form.email),
      phone:    validateField('phone',    form.phone),
      password: validateField('password', form.password),
      confirm:  validateField('confirm',  confirm),
   });

   const isValid = Object.values(allErrors()).every(e => !e);

   // ── обработчики ───────────────────────────────────────────────────────────
   const handleChange = (field: keyof UserFormData, value: string) => {
      setForm(prev => ({ ...prev, [field]: value }));
      if (touched[field]) {
         setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
      }
      // confirm зависит от password
      if (field === 'password' && touched.confirm) {
         setErrors(prev => ({ ...prev, confirm: value !== confirm ? 'Passwords do not match' : '' }));
      }
   };

   const handleBlur = (field: string, value: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
   };

   const handleSave = (e: React.MouseEvent) => {
      e.preventDefault();
      // Помечаем все поля затронутыми чтобы показать ошибки
      setTouched({ name: true, email: true, phone: true, password: true, confirm: true });
      const errs = allErrors();
      setErrors(errs);
      if (Object.values(errs).some(e => e)) return;

      updateUser({ id: String(id), ...form });
      setOriginal(form);
      showToast('Profile updated');
      navigate(-1);
   };

   const handleCancel = () => navigate(-1);

   const avatarLetters = form.name.trim().slice(0, 2).toUpperCase() || '??';

   if (isLoading) {
      return (
         <div className={styles.card}>
            <div className={styles.skeletonAvatar} />
            {[1, 2, 3].map(i => <div key={i} className={styles.skeletonField} />)}
         </div>
      );
   }

   return (
      <div className={styles.page}>
         <form className={styles.card} noValidate>

            {/* ── Аватар ── */}
            <div className={styles.avatarSection}>
               <div className={styles.avatar}>{avatarLetters}</div>
               <div className={styles.avatarHint}>
                  <p className={styles.avatarName}>{form.name || 'Your name'}</p>
                  <p className={styles.avatarSub}>{form.email || 'your@email.com'}</p>
               </div>
            </div>

            <div className={styles.divider} />

            {/* ── Профиль ── */}
            <section className={styles.section}>
               <p className={styles.sectionTitle}>Profile info</p>

               <Field
                  label="Name"
                  type="text"
                  value={form.name}
                  error={touched.name ? errors.name : ''}
                  onChange={v => handleChange('name', v)}
                  onBlur={v => handleBlur('name', v)}
                  placeholder="Your full name"
               />
               <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  error={touched.email ? errors.email : ''}
                  onChange={v => handleChange('email', v)}
                  onBlur={v => handleBlur('email', v)}
                  placeholder="you@example.com"
               />
               <Field
                  label="Phone"
                  type="tel"
                  value={form.phone}
                  error={touched.phone ? errors.phone : ''}
                  onChange={v => handleChange('phone', v)}
                  onBlur={v => handleBlur('phone', v)}
                  placeholder="+1 234 567 890 (optional)"
               />
            </section>

            <div className={styles.divider} />

            {/* ── Пароль ── */}
            <section className={styles.section}>
               <p className={styles.sectionTitle}>Password</p>

               <Field
                  label="New password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  error={touched.password ? errors.password : ''}
                  onChange={v => handleChange('password', v)}
                  onBlur={v => handleBlur('password', v)}
                  placeholder="Min 6 characters"
                  action={
                     <button type="button" className={styles.toggleBtn} onClick={() => setShowPass(p => !p)}>
                        {showPass ? 'Hide' : 'Show'}
                     </button>
                  }
               />
               <Field
                  label="Confirm password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  error={touched.confirm ? errors.confirm : ''}
                  onChange={v => { setConfirm(v); if (touched.confirm) setErrors(prev => ({ ...prev, confirm: validateField('confirm', v) })); }}
                  onBlur={v => handleBlur('confirm', v)}
                  placeholder="Repeat password"
                  action={
                     <button type="button" className={styles.toggleBtn} onClick={() => setShowConfirm(p => !p)}>
                        {showConfirm ? 'Hide' : 'Show'}
                     </button>
                  }
               />
            </section>

            {/* ── Кнопки ── */}
            <div className={styles.actions}>
               <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                  Cancel
               </button>
               <button
                  type="submit"
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={!hasChanges || !isValid}
                  title={!hasChanges ? 'No changes' : !isValid ? 'Fix errors first' : 'Save changes'}
               >
                  {hasChanges ? 'Save changes' : 'No changes'}
               </button>
            </div>

         </form>
      </div>
   );
};

// ── Переиспользуемое поле ─────────────────────────────────────────────────────
interface FieldProps {
   label: string;
   type: string;
   value: string;
   error?: string;
   placeholder?: string;
   onChange: (v: string) => void;
   onBlur: (v: string) => void;
   action?: React.ReactNode;
}

const Field = ({ label, type, value, error, placeholder, onChange, onBlur, action }: FieldProps) => (
   <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputRow}>
         <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            onBlur={e => onBlur(e.target.value)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoComplete="off"
         />
         {action}
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
   </div>
);
