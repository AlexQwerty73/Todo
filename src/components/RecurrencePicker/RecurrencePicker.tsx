import styles from './RecurrencePicker.module.css';
import { Recurrence, RecurrenceType, IntervalUnit } from '../../redux/todosApi';

interface Props {
   value: Recurrence | undefined;
   onChange: (r: Recurrence | undefined) => void;
}

const TYPES: { value: RecurrenceType | 'none'; label: string }[] = [
   { value: 'none',    label: 'None' },
   { value: 'daily',   label: 'Daily' },
   { value: 'weekly',  label: 'Weekly' },
   { value: 'monthly', label: 'Monthly' },
   { value: 'custom',  label: 'Custom' },
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const UNITS: { value: IntervalUnit; label: string }[] = [
   { value: 'days',   label: 'days' },
   { value: 'weeks',  label: 'weeks' },
   { value: 'months', label: 'months' },
];

export const RecurrencePicker = ({ value, onChange }: Props) => {
   const activeType = value?.type ?? 'none';
   const isCustomInterval = value?.type === 'custom' && !value.weekDays?.length;
   const isCustomWeekdays = value?.type === 'custom' && !!value.weekDays?.length;

   const setType = (t: RecurrenceType | 'none') => {
      if (t === 'none') { onChange(undefined); return; }
      if (t === 'custom') {
         onChange({ type: 'custom', interval: 1, intervalUnit: 'days' });
      } else {
         onChange({ type: t });
      }
   };

   const setCustomMode = (mode: 'interval' | 'weekdays') => {
      if (mode === 'interval') onChange({ type: 'custom', interval: 1, intervalUnit: 'days' });
      else onChange({ type: 'custom', weekDays: [] });
   };

   const setInterval = (n: number) =>
      onChange({ ...value!, type: 'custom', interval: Math.max(1, n), weekDays: undefined });

   const setIntervalUnit = (u: IntervalUnit) =>
      onChange({ ...value!, type: 'custom', intervalUnit: u, weekDays: undefined });

   const toggleWeekDay = (d: number) => {
      const current = value?.weekDays ?? [];
      const next = current.includes(d) ? current.filter(x => x !== d) : [...current, d].sort();
      onChange({ type: 'custom', weekDays: next });
   };

   return (
      <div className={styles.wrapper}>
         {/* Тип повторения */}
         <div className={styles.typeRow}>
            {TYPES.map(t => (
               <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value as RecurrenceType | 'none')}
                  className={`${styles.typeBtn} ${activeType === t.value ? styles.typeBtnActive : ''}`}
               >
                  {t.label}
               </button>
            ))}
         </div>

         {/* Custom: переключатель режима */}
         {value?.type === 'custom' && (
            <div className={styles.customBlock}>
               <div className={styles.modeRow}>
                  <button
                     type="button"
                     onClick={() => setCustomMode('interval')}
                     className={`${styles.modeBtn} ${!isCustomWeekdays ? styles.modeBtnActive : ''}`}
                  >
                     Every N
                  </button>
                  <button
                     type="button"
                     onClick={() => setCustomMode('weekdays')}
                     className={`${styles.modeBtn} ${isCustomWeekdays ? styles.modeBtnActive : ''}`}
                  >
                     Weekdays
                  </button>
               </div>

               {/* Каждые N единиц */}
               {!isCustomWeekdays && (
                  <div className={styles.intervalRow}>
                     <span className={styles.intervalLabel}>Every</span>
                     <input
                        type="number"
                        min={1}
                        value={value.interval ?? 1}
                        onChange={e => setInterval(Number(e.target.value))}
                        className={styles.intervalInput}
                     />
                     <div className={styles.unitRow}>
                        {UNITS.map(u => (
                           <button
                              key={u.value}
                              type="button"
                              onClick={() => setIntervalUnit(u.value)}
                              className={`${styles.unitBtn} ${value.intervalUnit === u.value ? styles.unitBtnActive : ''}`}
                           >
                              {u.label}
                           </button>
                        ))}
                     </div>
                  </div>
               )}

               {/* Конкретные дни недели */}
               {isCustomWeekdays && (
                  <div className={styles.weekdaysRow}>
                     {WEEKDAYS.map((label, i) => (
                        <button
                           key={i}
                           type="button"
                           onClick={() => toggleWeekDay(i)}
                           className={`${styles.dayBtn} ${(value.weekDays ?? []).includes(i) ? styles.dayBtnActive : ''}`}
                        >
                           {label}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         )}
      </div>
   );
};
