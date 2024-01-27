import React from 'react';

export const LabelName = ({ styles, userData, handleChange }) => {
   return (
      <label className={styles.formLabel}>Name:
         <input
            type="text"
            className={styles.formInput}
            placeholder="Enter your name"
            name="name"
            value={userData.name}
            onChange={handleChange}
         />
      </label>
   );
};