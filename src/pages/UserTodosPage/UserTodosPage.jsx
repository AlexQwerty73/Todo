import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetTodosByUserIdQuery, useGetUsersQuery } from '../../redux/';
import { AddTodoForm, TodosList } from '../../components';

export const UserTodosPage = () => {
   const { id } = useParams();
   const { data: user } = useGetUsersQuery(id);
   const { data: todos } = useGetTodosByUserIdQuery(id);

   return (
      <div>
         <h2>User Name: {user?.name || `Loading...`}</h2>

         <AddTodoForm />

         <TodosList todos={todos} />

      </div>
   );
};
