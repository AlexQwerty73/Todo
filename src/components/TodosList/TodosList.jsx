import React from 'react';
import { TodoItem } from '../TodoItem';

export const TodosList = ({ todos }) => {
   return (
      <ul>

         {
            todos?.map((todo, index) =>
               <TodoItem key={index} index={index} todo={todo}/>
            ) || `Loading...`
         }

      </ul>
   );
};
