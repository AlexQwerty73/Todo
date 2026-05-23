import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

// Types for the data we work with
export interface Todo {
   id: string;
   userId: string;
   title: string;
   completed: boolean;
   description?: string;
   deadline?: string;
}

export interface AddTodoBody {
   userId: string;
   title: string;
   completed: boolean;
   description?: string;
   deadline?: string;
}

// Creating API for working with todos
export const todosApi = createApi({
   reducerPath: 'todosApi',
   tagTypes: ['Todos'],
   baseQuery: fetchBaseQuery({ baseUrl }),

   endpoints: (build) => ({

      // Get all todos
      getTodos: build.query<Todo[], string | undefined>({
         query: (limit = '') => `todos${limit && `?_limit=${limit}`}`,
         providesTags: (result) =>
            result
               ? [
                  ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
                  { type: 'Todos' as const, id: 'LIST' },
               ]
               : [{ type: 'Todos' as const, id: 'LIST' }],
      }),

      // Get todos by user ID
      getTodosByUserId: build.query<Todo[], string>({
         query: (userId) => `todos?userId=${userId}`,
         providesTags: (result, error, userId) =>
            result
               ? [
                  ...result.map(({ id }) => ({ type: 'Todos' as const, id })),
                  { type: 'Todos' as const, id: 'LIST', userId },
               ]
               : [{ type: 'Todos' as const, id: 'LIST', userId }],
      }),

      // Add a new todo
      addTodo: build.mutation<Todo, AddTodoBody>({
         query: (body) => ({
            url: 'todos',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

      // Delete a todo
      delTodo: build.mutation<void, string>({
         query: (id) => ({
            url: `todos/${id}`,
            method: 'DELETE',
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

      // Update a todo
      updateTodo: build.mutation<Todo, Todo>({
         query: (body) => ({
            url: `todos/${body.id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

   }),
});

// Exporting hooks for each API operation
export const {
   useAddTodoMutation,
   useGetTodosQuery,
   useDelTodoMutation,
   useUpdateTodoMutation,
   useGetTodosByUserIdQuery,
} = todosApi;