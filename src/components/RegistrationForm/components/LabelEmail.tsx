import { LabelProps } from "./LabelProps";

export const LabelEmail = ({ styles, userData, handleChange }: LabelProps) => {
   return (
      <label className={styles.formLabel}>Email:
         <input
            type="email"
            className={styles.formInput}
            placeholder="Enter your email"
            name="email"
            value={userData.email}
            onChange={handleChange}
         />
      </label>
   );
};