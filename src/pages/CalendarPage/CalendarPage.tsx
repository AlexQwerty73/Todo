import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTodosByUserIdQuery } from '../../redux';
import { Todo } from '../../redux/todosApi';
import styles from './CalendarPage.module.css';
import { DayModal } from './DayModal';
import { isTodoOnDate } from '../../utils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS   = [
   'January', 'February', 'March', 'April', 'May', 'June',
   'July', 'August', 'September', 'October', 'November', 'December',
];

const priorityColor = (todo: Todo) =>
   todo.priority === 'high' ? '#f07070' : todo.priority === 'low' ? '#4caf7d' : '#e0a060';

export const CalendarPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: todos = [] } = useGetTodosByUserIdQuery(id ?? '');

   const [today, setToday]               = useState(() => new Date());
   const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
   const [currentMonth, setCurrentMonth] = useState(today.getMonth());
   const [selectedDay,  setSelectedDay]  = useState<Date | null>(null);

   // Обновляем «сегодня» ровно в полночь
   useEffect(() => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const timer = setTimeout(() => setToday(new Date()), midnight.getTime() - now.getTime());
      return () => clearTimeout(timer);
   }, [today]);

   const firstDay = new Date(currentYear, currentMonth, 1);
   const lastDay  = new Date(currentYear, currentMonth + 1, 0);
   const startOffset = (firstDay.getDay() + 6) % 7;
   const totalCells  = startOffset + lastDay.getDate();
   const cells       = Math.ceil(totalCells / 7) * 7;

   const getTodosForDay = (date: Date): Todo[] =>
      todos.filter(todo => isTodoOnDate(todo, date));

   const prevMonth = () => {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
      else setCurrentMonth(m => m - 1);
   };

   const nextMonth = () => {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
      else setCurrentMonth(m => m + 1);
   };

   const goToday = () => {
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
   };

   const isCurrentPeriod =
      currentYear === today.getFullYear() && currentMonth === today.getMonth();

   return (
      <div className={styles.page}>

         {/* ── Шапка ── */}
         <div className={styles.header}>
            <div className={styles.titleArea}>
               <span className={styles.pageLabel}>Calendar</span>
               <h1 className={styles.title}>{MONTHS[currentMonth]} {currentYear}</h1>
            </div>
            <div className={styles.navGroup}>
               {!isCurrentPeriod && (
                  <button className={styles.todayBtn} onClick={goToday}>Today</button>
               )}
               <button className={styles.navBtn} onClick={prevMonth}>‹</button>
               <button className={styles.navBtn} onClick={nextMonth}>›</button>
            </div>
         </div>

         {/* ── Дни недели ── */}
         <div className={styles.weekdays}>
            {WEEKDAYS.map(d => (
               <div key={d} className={styles.weekday}>{d}</div>
            ))}
         </div>

         {/* ── Сетка ── */}
         <div className={styles.grid}>
            {Array.from({ length: cells }).map((_, i) => {
               const dayNum = i - startOffset + 1;
               const isCurrentMonth = dayNum >= 1 && dayNum <= lastDay.getDate();
               const date = new Date(currentYear, currentMonth, dayNum);

               const isToday = isCurrentMonth
                  && dayNum === today.getDate()
                  && currentMonth === today.getMonth()
                  && currentYear === today.getFullYear();

               const dayTodos = isCurrentMonth ? getTodosForDay(date) : [];

               return (
                  <div
                     key={i}
                     className={[
                        styles.cell,
                        !isCurrentMonth ? styles.outside : '',
                        isToday          ? styles.today   : '',
                     ].join(' ')}
                     onClick={() => isCurrentMonth && setSelectedDay(date)}
                  >
                     <span className={styles.dayNum}>
                        {isCurrentMonth ? dayNum : ''}
                     </span>

                     <div className={styles.todoChips}>
                        {dayTodos.slice(0, 3).map(todo => (
                           <span
                              key={todo.id}
                              className={`${styles.chip} ${todo.completed ? styles.chipDone : ''}`}
                              style={{ borderLeft: `2px solid ${priorityColor(todo)}` }}
                           >
                              {todo.title.length > 14
                                 ? todo.title.slice(0, 14) + '…'
                                 : todo.title}
                           </span>
                        ))}
                        {dayTodos.length > 3 && (
                           <span className={styles.more}>+{dayTodos.length - 3} more</span>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>

         {selectedDay && (
            <DayModal
               date={selectedDay}
               todos={getTodosForDay(selectedDay)}
               onClose={() => setSelectedDay(null)}
            />
         )}
      </div>
   );
};
