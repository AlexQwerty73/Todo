import { LabelProps } from "./LabelProps";

export const LabelPhone = ({ styles, userData, handleChange }: LabelProps) => {
   return (
      <label className={styles.formLabel}>Phone:
         <input
            type="tel"
            className={styles.formInput}
            placeholder="Enter your phone number"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
         />
      </label>
   );
};