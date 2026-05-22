import { configureStore } from "@reduxjs/toolkit";
import { todosApi } from "./todosApi";
import { usersApi } from "./usersApi";

// Creating the central store using Redux Toolkit configuration
export const store = configureStore({
   // Defining reducers for handling API-related state
   reducer: {
      [todosApi.reducerPath]: todosApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer,
   },

   // Adding middleware to handle async API operations
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(todosApi.middleware, usersApi.middleware),
});

// Types inferred from the store — used throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;