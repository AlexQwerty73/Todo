import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

export type Priority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type IntervalUnit = 'days' | 'weeks' | 'months';

export interface Recurrence {
   type: RecurrenceType;
   // Свой вариант А: каждые N единиц
   interval?: number;
   intervalUnit?: IntervalUnit;
   // Свой вариант Б: конкретные дни недели (0=Пн … 6=Вс)
   weekDays?: number[];
}

export interface Subtask {
   id: string;
   title: string;
   completed: boolean;
}

export interface Todo {
   id: string;
   userId: string;
   title: string;
   completed: boolean;
   description?: string;
   deadline?: string;
   priority?: Priority;
   subtasks?: Subtask[];
   recurrence?: Recurrence;
}

export interface AddTodoBody {
   userId: string;
   title: string;
   completed: boolean;
   description?: string;
   deadline?: string;
   priority?: Priority;
   subtasks?: Subtask[];
   recurrence?: Recurrence;
}

export const todosApi = createApi({
   reducerPath: 'todosApi',
   tagTypes: ['Todos'],
   baseQuery: fetchBaseQuery({ baseUrl }),

   endpoints: (build) => ({

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

      addTodo: build.mutation<Todo, AddTodoBody>({
         query: (body) => ({
            url: 'todos',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

      delTodo: build.mutation<void, string>({
         query: (id) => ({
            url: `todos/${id}`,
            method: 'DELETE',
         }),
         invalidatesTags: [{ type: 'Todos', id: 'LIST' }],
      }),

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

export const {
   useAddTodoMutation,
   useGetTodosQuery,
   useDelTodoMutation,
   useUpdateTodoMutation,
   useGetTodosByUserIdQuery,
} = todosApi;