import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

// створення API для роботи зі списком завдань (todos)
export const todosApi = createApi({
   reducerPath: 'todosApi',
   tagTypes: ['Todos'],
   baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),

   // опис різних ендпоінтів для роботи з API
   endpoints: (build) => ({

      // Отримання списку завдань
      getTodos: build.query({
         query: (limit = '') => `todos${limit && `?_limit=${limit}`}`,
         //Кешування
         providesTags: (result) =>
            result
               ? [
                  ...result.map(({ id }) => ({ type: 'Todos', id })),
                  { type: 'Todos', id: 'LIST' },
               ]
               : [{ type: 'Todos', id: 'LIST' }],
      }),

      getTodosByUserId: build.query({
         query: (userId, limit = '') => `todos?userId=${userId}${limit && `&_limit=${limit}`}`,
         providesTags: (result, error, userId) => 
            result
               ? [
                  ...result.map(({ id }) => ({ type: 'Todos', id })),
                  { type: 'Todos', id: 'LIST', userId },
               ]
               : [{ type: 'Todos', id: 'LIST', userId }],
      }),
   

      // Додавання нового завдання
      addTodo: build.mutation({
         query: (body) => ({
            url: 'todos',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }]
      }),

      // Видалення завдання
      delTodo: build.mutation({
         query: (id) => ({
            url: `todos/${id}`,
            method: 'DELETE',
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

      // Оновлення завдання
      updateTodo: build.mutation({
         query: (body) => ({
            url: `todos/${body.id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      })

   }),
});

// Витягуємо готові хуки для використання різних операцій з API
export const { useAddTodoMutation, useGetTodosQuery, useDelTodoMutation, useUpdateTodoMutation, useGetTodosByUserIdQuery } = todosApi;
