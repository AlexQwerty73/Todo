export const saveToLocalStorage = (key: string, data: unknown): void => {
   try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
   } catch (error) {
      console.error('Error saving data to local storage:', error);
   }
};