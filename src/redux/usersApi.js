import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

export const usersApi = createApi({
   reducerPath: 'usersApi',
   tagTypes: ['Users'],
   baseQuery: fetchBaseQuery({ baseUrl: baseUrl }),

   endpoints: (build) => ({

      getUsers: build.query({
         query: (id = '') => `users${id && `/${id}`}`,
         providesTags: (result) =>
            result && Array.isArray(result)
               ? [
                  ...result.map(({ id }) => ({ type: 'Users', id })),
                  { type: 'Users', id: 'LIST' },
               ]
               : [{ type: 'Users', id: 'LIST' }],
      }),

      addUser: build.mutation({
         query: (body) => ({
            url: 'users',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'Users', id: 'LIST' }]
      }),
      
      updateUser: build.mutation({
         query: (body) => ({
            url: `users/${body.id}`,
            method: 'PUT',
            body,
         }),
         invalidatesTags: [{ type: 'Users', id: 'LIST' }],
      })

   }),
});

export const { useGetUsersQuery, useAddUserMutation, useUpdateUserMutation } = usersApi;
