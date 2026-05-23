import React, { useState, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';

// Composant de recherche ISOLÉ avec son propre state
// Le state local empêche le parent de causer des re-renders de l'input
const SearchInput = React.memo(({ placeholder, onSearchChange, debounceMs = 300 }) => {
  const [value, setValue] = useState('');
  const timeoutRef = useRef(null);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;

    // Mise à jour SYNCHRONE du state local (pas de lag visuel)
    setValue(newValue);

    // Clear le timeout précédent
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si vide, notifier immédiatement le parent
    if (newValue === '') {
      onSearchChange('');
      return;
    }

    // Sinon, debounce la notification au parent
    timeoutRef.current = setTimeout(() => {
      onSearchChange(newValue);
    }, debounceMs);
  }, [onSearchChange, debounceMs]);

  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        placeholder={placeholder}
      />
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
