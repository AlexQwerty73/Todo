import { Todo, Recurrence } from '../redux/todosApi';

/** Проверяет, должна ли задача отображаться в конкретный день с учётом повторения */
export const isTodoOnDate = (todo: Todo, date: Date): boolean => {
   if (!todo.deadline) return false;

   const deadline = new Date(todo.deadline);
   deadline.setHours(0, 0, 0, 0);

   const check = new Date(date);
   check.setHours(0, 0, 0, 0);

   // Точное совпадение с дедлайном
   if (deadline.getTime() === check.getTime()) return true;

   // Дата раньше дедлайна или нет повторения — нет
   if (!todo.recurrence || check < deadline) return false;

   const { type, interval = 1, intervalUnit = 'days', weekDays } = todo.recurrence;

   switch (type) {
      case 'daily':
         return true;

      case 'weekly':
         return deadline.getDay() === check.getDay();

      case 'monthly':
         return deadline.getDate() === check.getDate();

      case 'custom': {
         // Конкретные дни недели (0=Пн…6=Вс)
         if (weekDays && weekDays.length > 0) {
            const dow = (check.getDay() + 6) % 7;
            return weekDays.includes(dow);
         }
         // Каждые N единиц
         const diffMs = check.getTime() - deadline.getTime();
         const diffDays = Math.round(diffMs / 86_400_000);
         switch (intervalUnit) {
            case 'days':   return diffDays % interval === 0;
            case 'weeks':  return diffDays % (interval * 7) === 0;
            case 'months': {
               const months =
                  (check.getFullYear() - deadline.getFullYear()) * 12 +
                  (check.getMonth() - deadline.getMonth());
               return months % interval === 0 && deadline.getDate() === check.getDate();
            }
         }
         return false;
      }
   }
};

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Человекочитаемая метка повторения */
export const getRecurrenceLabel = (recurrence: Recurrence): string => {
   switch (recurrence.type) {
      case 'daily':   return 'Every day';
      case 'weekly':  return 'Every week';
      case 'monthly': return 'Every month';
      case 'custom':
         if (recurrence.weekDays?.length) {
            return recurrence.weekDays.map(d => WEEKDAY_LABELS[d]).join(', ');
         }
         return `Every ${recurrence.interval} ${recurrence.intervalUnit}`;
   }
};
