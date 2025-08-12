import { useEffect } from 'react';

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    const body = document.body;
    if (active) {
      body.classList.add('modal-open');
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.height = '100%';
    } else {
      body.classList.remove('modal-open');
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
    }
    return () => {
      body.classList.remove('modal-open');
      body.style.overflow = '';
      body.style.position = '';
      body.style.width = '';
      body.style.height = '';
    };
  }, [active]);
}
