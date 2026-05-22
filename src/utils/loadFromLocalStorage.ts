export const loadFromLocalStorage = <T>(key: string): T | null => {
   try {
      const serializedData = localStorage.getItem(key);
      return serializedData ? JSON.parse(serializedData) as T : null;
   } catch (error) {
      console.error('Error reading data from local storage:', error);
      return null;
   }
};