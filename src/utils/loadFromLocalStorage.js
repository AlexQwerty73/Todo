export const loadFromLocalStorage = (key) => {
   try {
     const serializedData = localStorage.getItem(key);
     return serializedData ? JSON.parse(serializedData) : null;
   } catch (error) {
     console.error('Error reading data from local storage:', error);
     return null;
   }
 };