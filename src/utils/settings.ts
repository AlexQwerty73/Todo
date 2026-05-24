import { Priority } from '../redux/todosApi';
import { loadFromLocalStorage } from './loadFromLocalStorage';

export interface UserSettings {
   defaultPriority: Priority;
   historyPageSize: number;
   todosPageSize: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
   defaultPriority: 'medium',
   historyPageSize: 10,
   todosPageSize: 7,
};

export const getSettingsKey = (userId: string) => `settings:${userId}`;

export const loadSettings = (userId: string): UserSettings => {
   const saved = loadFromLocalStorage<Partial<UserSettings>>(getSettingsKey(userId));
   return { ...DEFAULT_SETTINGS, ...saved };
};
