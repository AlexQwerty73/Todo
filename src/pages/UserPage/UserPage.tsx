import { UserData } from '../../components';

interface UserPageProps {
   editMode?: boolean;
}

export const UserPage = ({ editMode }: UserPageProps) => {
   return (
      <div>
         <UserData editMode={editMode} />
      </div>
   );
};