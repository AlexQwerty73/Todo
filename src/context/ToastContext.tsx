import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
   id: number;
   message: string;
   type: ToastType;
}

interface ToastContextType {
   showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
   const [toasts, setToasts] = useState<Toast[]>([]);

   const showToast = useCallback((message: string, type: ToastType = 'success') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
         setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
   }, []);

   return (
      <ToastContext.Provider value={{ showToast }}>
         {children}
         <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 1000,
         }}>
            {toasts.map(toast => (
               <div key={toast.id} style={{
                  background: toast.type === 'error' ? '#2d1a1a' : '#1a1a2e',
                  border: `0.5px solid ${toast.type === 'error' ? '#5a2a2a' : '#7c5cfc'}`,
                  color: toast.type === 'error' ? '#f07070' : '#e0e0e0',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  animation: 'slideIn 0.2s ease',
               }}>
                  {toast.message}
               </div>
            ))}
         </div>
         <style>{`
            @keyframes slideIn {
               from { opacity: 0; transform: translateX(20px); }
               to { opacity: 1; transform: translateX(0); }
            }
         `}</style>
      </ToastContext.Provider>
   );
};

export const useToast = () => {
   const ctx = useContext(ToastContext);
   if (!ctx) throw new Error('useToast must be used inside ToastProvider');
   return ctx;
};