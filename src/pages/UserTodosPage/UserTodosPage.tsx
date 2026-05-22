import { useParams } from 'react-router-dom';
import { useGetTodosByUserIdQuery, useGetUsersQuery } from '../../redux/';
import { AddTodoForm, TodosList } from '../../components';
import { User } from '../../redux/usersApi';

export const UserTodosPage = () => {
   const { id } = useParams<{ id: string }>();

   const { data: user } = useGetUsersQuery(id);
   const { data: todos } = useGetTodosByUserIdQuery(id ?? '');

   return (
      <div>
         <h2>User Name: {(user as User)?.name ?? 'Loading...'}</h2>
         <AddTodoForm />
         <TodosList todos={todos} />
      </div>
   );
};