import { LabelProps } from "./LabelProps";

export const LabelPassword = ({ styles, userData, handleChange }: LabelProps) => {
   return (
      <label className={styles.formLabel}>Password:
         <input
            type="password"
            className={styles.formInput}
            placeholder="Enter your password"
            name="password"
            value={userData.password}
            onChange={handleChange}
         />
      </label>
   );
};