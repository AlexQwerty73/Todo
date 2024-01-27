import React from 'react';
import { UserData } from '../../components'

export const UserPage = ({ editMode }) => {

   return (
      <div>
         <UserData editMode={editMode} />
      </div>
   );
};