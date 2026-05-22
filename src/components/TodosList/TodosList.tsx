import { TodoItem } from '../TodoItem';
import { Todo } from '../../redux/todosApi';

interface TodosListProps {
   todos?: Todo[];
}

export const TodosList = ({ todos }: TodosListProps) => {
   return (
      <ul>
         {todos
            ? todos.map((todo, index) =>
               <TodoItem key={todo.id} index={index} todo={todo} />
            )
            : 'Loading...'
         }
      </ul>
   );
};