import { AddUserBody } from '../../../redux/usersApi';

export interface LabelProps {
   styles: Record<string, string>;
   userData: AddUserBody;
   handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}