import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetTodosByUserIdQuery } from '../../redux';
import { Todo } from '../../redux/todosApi';
import styles from './CalendarPage.module.css';
import { DayModal } from './DayModal';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
   'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarPage = () => {
   const { id } = useParams<{ id: string }>();
   const { data: todos = [] } = useGetTodosByUserIdQuery(id ?? '');

   const today = new Date();
   const [currentYear, setCurrentYear] = useState(today.getFullYear());
   const [currentMonth, setCurrentMonth] = useState(today.getMonth());
   const [selectedDay, setSelectedDay] = useState<Date | null>(null);

   const firstDay = new Date(currentYear, currentMonth, 1);
   const lastDay = new Date(currentYear, currentMonth + 1, 0);

   // Monday-based offset
   const startOffset = (firstDay.getDay() + 6) % 7;
   const totalCells = startOffset + lastDay.getDate();
   const cells = Math.ceil(totalCells / 7) * 7;

   const getTodosForDay = (date: Date): Todo[] => {
      return todos.filter(todo => {
         if (!todo.deadline) return false;
         const d = new Date(todo.deadline);
         return d.getFullYear() === date.getFullYear()
            && d.getMonth() === date.getMonth()
            && d.getDate() === date.getDate();
      });
   };

   const prevMonth = () => {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
      else setCurrentMonth(m => m - 1);
   };

   const nextMonth = () => {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
      else setCurrentMonth(m => m + 1);
   };

   return (
      <div className={styles.page}>
         <div className={styles.header}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <h2 className={styles.title}>{MONTHS[currentMonth]} {currentYear}</h2>
            <button className={styles.navBtn} onClick={nextMonth}>›</button>
         </div>

         <div className={styles.grid}>
            {WEEKDAYS.map(d => (
               <div key={d} className={styles.weekday}>{d}</div>
            ))}

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
                     className={`${styles.cell} ${!isCurrentMonth ? styles.outside : ''} ${isToday ? styles.today : ''}`}
                     onClick={() => isCurrentMonth && setSelectedDay(date)}
                  >
                     <span className={styles.dayNum}>{isCurrentMonth ? dayNum : ''}</span>
                     <div className={styles.todoChips}>
                        {dayTodos.slice(0, 3).map(todo => (
                           <span
                              key={todo.id}
                              className={`${styles.chip} ${todo.completed ? styles.chipDone : ''}`}
                              style={{ borderLeft: `2px solid ${todo.priority === 'high' ? '#f07070' : todo.priority === 'low' ? '#4caf7d' : '#e0a060'}` }}
                           >
                              {todo.title.length > 12 ? todo.title.slice(0, 12) + '…' : todo.title}
                           </span>
                        ))}
                        {dayTodos.length > 3 && (
                           <span className={styles.more}>+{dayTodos.length - 3}</span>
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