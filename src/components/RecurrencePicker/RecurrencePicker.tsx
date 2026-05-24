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
   const activeType      = value?.type ?? 'none';
   const isCustomWeekdays = value?.type === 'custom' && !!value.weekDays?.length;

   const setType = (t: RecurrenceType | 'none') => {
      if (t === 'none') { onChange(undefined); return; }
      const endDate = value?.endDate;
      if (t === 'custom') {
         onChange({ type: 'custom', interval: 1, intervalUnit: 'days', endDate });
      } else {
         onChange({ type: t, endDate });
      }
   };

   const setCustomMode = (mode: 'interval' | 'weekdays') => {
      const endDate = value?.endDate;
      if (mode === 'interval') onChange({ type: 'custom', interval: 1, intervalUnit: 'days', endDate });
      else onChange({ type: 'custom', weekDays: [], endDate });
   };

   const setInterval = (n: number) =>
      onChange({ ...value!, type: 'custom', interval: Math.max(1, n), weekDays: undefined });

   const setIntervalUnit = (u: IntervalUnit) =>
      onChange({ ...value!, type: 'custom', intervalUnit: u, weekDays: undefined });

   const toggleWeekDay = (d: number) => {
      const current = value?.weekDays ?? [];
      const next = current.includes(d) ? current.filter(x => x !== d) : [...current, d].sort();
      onChange({ ...value!, type: 'custom', weekDays: next });
   };

   const setEndDate = (dateStr: string) => {
      if (!value) return;
      onChange({ ...value, endDate: dateStr || undefined });
   };

   // Today's date in yyyy-mm-dd for min attribute
   const todayStr = new Date().toISOString().split('T')[0];

   return (
      <div className={styles.wrapper}>

         {/* Repeat type */}
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

         {/* Custom mode — interval or specific weekdays */}
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

         {/* End date — visible whenever recurrence is active */}
         {value && (
            <div className={styles.endDateRow}>
               <span className={styles.endDateLabel}>Until</span>
               <input
                  type="date"
                  min={todayStr}
                  className={styles.endDateInput}
                  value={value.endDate ? value.endDate.split('T')[0] : ''}
                  onChange={e => setEndDate(e.target.value)}
               />
               {value.endDate && (
                  <button
                     type="button"
                     className={styles.clearEndDate}
                     onClick={() => setEndDate('')}
                     title="Remove end date"
                  >✕</button>
               )}
               {!value.endDate && (
                  <span className={styles.endDateHint}>optional</span>
               )}
            </div>
         )}

      </div>
   );
};
