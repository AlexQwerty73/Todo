import { Todo, Recurrence } from '../redux/todosApi';

// ─── Next occurrence ──────────────────────────────────────────────────────────

/**
 * Given the current deadline of a recurring todo, returns the ISO string of
 * the next occurrence, or null if the recurrence has ended (endDate exceeded).
 */
export const getNextRecurrenceDate = (deadline: string, recurrence: Recurrence): string | null => {
   const current = new Date(deadline);
   const next    = new Date(current);

   const { type, interval = 1, intervalUnit = 'days', weekDays, endDate } = recurrence;

   switch (type) {
      case 'daily':
         next.setDate(next.getDate() + 1);
         break;

      case 'weekly':
         next.setDate(next.getDate() + 7);
         break;

      case 'monthly':
         next.setMonth(next.getMonth() + 1);
         break;

      case 'custom':
         if (weekDays && weekDays.length > 0) {
            // Our system: 0 = Mon … 6 = Sun; JS getDay(): 0 = Sun
            const currentDow = (current.getDay() + 6) % 7;
            let minDiff = 7;
            for (const day of weekDays) {
               let diff = (day - currentDow + 7) % 7;
               if (diff === 0) diff = 7; // same day → skip to next week
               if (diff < minDiff) minDiff = diff;
            }
            next.setDate(next.getDate() + minDiff);
         } else {
            switch (intervalUnit) {
               case 'days':   next.setDate(next.getDate() + interval); break;
               case 'weeks':  next.setDate(next.getDate() + interval * 7); break;
               case 'months': next.setMonth(next.getMonth() + interval); break;
            }
         }
         break;
   }

   // Respect end date
   if (endDate && next.getTime() > new Date(endDate).getTime()) return null;

   return next.toISOString();
};

// ─── Calendar helper ──────────────────────────────────────────────────────────

/** Returns true if a recurring todo should appear on the given calendar date */
export const isTodoOnDate = (todo: Todo, date: Date): boolean => {
   if (!todo.deadline) return false;

   const deadline = new Date(todo.deadline);
   deadline.setHours(0, 0, 0, 0);

   const check = new Date(date);
   check.setHours(0, 0, 0, 0);

   // Exact deadline match
   if (deadline.getTime() === check.getTime()) return true;

   // Before deadline or no recurrence — no
   if (!todo.recurrence || check < deadline) return false;

   // Past end date — no
   if (todo.recurrence.endDate) {
      const end = new Date(todo.recurrence.endDate);
      end.setHours(0, 0, 0, 0);
      if (check > end) return false;
   }

   const { type, interval = 1, intervalUnit = 'days', weekDays } = todo.recurrence;

   switch (type) {
      case 'daily':
         return true;

      case 'weekly':
         return deadline.getDay() === check.getDay();

      case 'monthly':
         return deadline.getDate() === check.getDate();

      case 'custom': {
         if (weekDays && weekDays.length > 0) {
            const dow = (check.getDay() + 6) % 7;
            return weekDays.includes(dow);
         }
         const diffDays = Math.round((check.getTime() - deadline.getTime()) / 86_400_000);
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

// ─── Label ────────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/** Human-readable recurrence label, including end date if set */
export const getRecurrenceLabel = (recurrence: Recurrence): string => {
   let base: string;
   switch (recurrence.type) {
      case 'daily':   base = 'Every day';   break;
      case 'weekly':  base = 'Every week';  break;
      case 'monthly': base = 'Every month'; break;
      case 'custom':
         base = recurrence.weekDays?.length
            ? recurrence.weekDays.map(d => WEEKDAY_LABELS[d]).join(', ')
            : `Every ${recurrence.interval} ${recurrence.intervalUnit}`;
         break;
   }
   if (recurrence.endDate) {
      const fmt = new Date(recurrence.endDate).toLocaleDateString([], {
         day: 'numeric', month: 'short',
      });
      base += ` · until ${fmt}`;
   }
   return base;
};
