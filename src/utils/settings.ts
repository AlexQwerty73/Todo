import { Priority } from '../redux/todosApi';
import { loadFromLocalStorage } from './loadFromLocalStorage';

export interface UserSettings {
   defaultPriority: Priority;
   historyPageSize: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
   defaultPriority: 'medium',
   historyPageSize: 12,
};

export const getSettingsKey = (userId: string) => `settings:${userId}`;

export const loadSettings = (userId: string): UserSettings => {
   const saved = loadFromLocalStorage<Partial<UserSettings>>(getSettingsKey(userId));
   return { ...DEFAULT_SETTINGS, ...saved };
};
