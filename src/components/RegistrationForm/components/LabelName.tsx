import { LabelProps } from "./LabelProps";

export const LabelName = ({ styles, userData, handleChange }: LabelProps) => {
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