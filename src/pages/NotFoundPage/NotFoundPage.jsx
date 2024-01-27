import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
   const navigate = useNavigate();

   return (
      <div>
         <h1>Page not found</h1>

         <h2 onClick={() => navigate(-1)}><a href="#">Home</a></h2>
      </div>
   );
};