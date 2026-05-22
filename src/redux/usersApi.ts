import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

// Types for the data we work with
export interface User {
   id: string;
   name: string;
   email: string;
   phone: string;
   password: string;
}

export type AddUserBody = Omit<User, 'id'>;

// Creating API for working with users
export const usersApi = createApi({
   reducerPath: 'usersApi',
   tagTypes: ['Users'],
   baseQuery: fetchBaseQuery({ baseUrl }),

   endpoints: (build) => ({

      // Get all users or single user by ID
      getUsers: build.query<User | User[], string | undefined>({
         query: (id) => `users${id !== undefined ? `/${id}` : ''}`,
         providesTags: (result) =>
            result && Array.isArray(result)
               ? [
                  ...result.map(({ id }) => ({ type: 'Users' as const, id })),
                  { type: 'Users' as const, id: 'LIST' },
               ]
               : [{ type: 'Users' as const, id: 'LIST' }],
      }),

      // Add a new user
      addUser: build.mutation<User, AddUserBody>({
         query: (body) => ({
            url: 'users',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      }),

      // Update a user
      updateUser: build.mutation<User, User>({
         query: (body) => ({
            url: `users/${body.id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      }),

   }),
});

// Exporting hooks for each API operation
export const {
   useGetUsersQuery,
   useAddUserMutation,
   useUpdateUserMutation,
} = usersApi;