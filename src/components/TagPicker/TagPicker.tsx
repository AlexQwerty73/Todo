import { useState, KeyboardEvent } from 'react';
import styles from './TagPicker.module.css';

interface TagPickerProps {
   value: string[];
   onChange: (tags: string[]) => void;
   placeholder?: string;
}

const TAG_COLORS: Record<string, string> = {};
const PALETTE = ['#7c5cfc', '#4caf7d', '#e0a060', '#f07070', '#5caafc', '#c05cfc', '#fc5c8a'];

export const getTagColor = (tag: string): string => {
   if (!TAG_COLORS[tag]) {
      const index = [...tag].reduce((acc, c) => acc + c.charCodeAt(0), 0) % PALETTE.length;
      TAG_COLORS[tag] = PALETTE[index];
   }
   return TAG_COLORS[tag];
};

export const TagPicker = ({ value, onChange, placeholder = 'Add tag…' }: TagPickerProps) => {
   const [input, setInput] = useState('');

   const addTag = () => {
      const tag = input.trim().toLowerCase().replace(/\s+/g, '-');
      if (!tag || value.includes(tag)) { setInput(''); return; }
      onChange([...value, tag]);
      setInput('');
   };

   const removeTag = (tag: string) => onChange(value.filter(t => t !== tag));

   const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
      if (e.key === 'Backspace' && !input && value.length) removeTag(value[value.length - 1]);
   };

   return (
      <div className={styles.wrapper}>
         {value.map(tag => (
            <span key={tag} className={styles.chip} style={{ borderColor: getTagColor(tag), color: getTagColor(tag) }}>
               {tag}
               <button className={styles.remove} onClick={() => removeTag(tag)}>×</button>
            </span>
         ))}
         <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder={value.length === 0 ? placeholder : ''}
         />
      </div>
   );
};
