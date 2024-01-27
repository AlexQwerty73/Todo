import { configureStore } from "@reduxjs/toolkit";
import { todosApi } from "./todosApi";
import { usersApi } from "./usersApi";

// Створення центрального зберігання (store) з використанням конфігурації Redux Toolkit
export const store = configureStore({
   // визначення редукторів для обробки стану, пов'язаного з API
   reducer: {
      [todosApi.reducerPath]: todosApi.reducer,
      [usersApi.reducerPath]: usersApi.reducer, 
   },

   // Додаємо middleware для обробки асинхронних операцій, пов'язаних з API
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(todosApi.middleware, usersApi.middleware),
});
