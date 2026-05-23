import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = 'http://localhost:3001/';

export type HistoryAction = 'added' | 'deleted' | 'completed' | 'reopened' | 'updated';

export interface HistoryEntry {
   id: string;
   userId: string;
   action: HistoryAction;
   title: string;
   timestamp: string;
}

export type AddHistoryBody = Omit<HistoryEntry, 'id'>;

export const historyApi = createApi({
   reducerPath: 'historyApi',
   tagTypes: ['History'],
   baseQuery: fetchBaseQuery({ baseUrl }),

   endpoints: (build) => ({

      getHistory: build.query<HistoryEntry[], string>({
         query: (userId) => `history?userId=${userId}`,
         providesTags: [{ type: 'History', id: 'LIST' }],
      }),

      addHistory: build.mutation<HistoryEntry, AddHistoryBody>({
         query: (body) => ({
            url: 'history',
            method: 'POST',
            body,
         }),
         invalidatesTags: [{ type: 'History', id: 'LIST' }],
      }),

      deleteHistory: build.mutation<void, string>({
         query: (id) => ({
            url: `history/${id}`,
            method: 'DELETE',
         }),
         invalidatesTags: [{ type: 'History', id: 'LIST' }],
      }),

   }),
});

export const { useGetHistoryQuery, useAddHistoryMutation, useDeleteHistoryMutation } = historyApi;