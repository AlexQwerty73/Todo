import { configureStore } from "@reduxjs/toolkit";
import { todosApi } from "./todosApi";
import { usersApi } from "./usersApi";
import { historyApi } from "./historyApi";

export const store = configureStore({
   reducer: {
      [todosApi.reducerPath]: todosApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
      [historyApi.reducerPath]: historyApi.reducer,
   },
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
         todosApi.middleware,
         usersApi.middleware,
         historyApi.middleware,
      ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;