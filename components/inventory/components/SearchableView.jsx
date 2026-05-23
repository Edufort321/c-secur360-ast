import React, { useState, useMemo } from 'react';

/**
 * Composant wrapper qui isole le state de recherche
 * pour éviter que les changements de searchTerm causent des re-renders du parent
 */
const SearchableView = ({ children, onSearchChange }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Notifier le parent avec le terme de recherche
  const handleSearch = (value) => {
    setLocalSearchTerm(value);
    onSearchChange(value);
  };

  // Cloner les enfants et injecter les props de recherche
  return useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          searchTerm: localSearchTerm,
          onSearchChange: handleSearch
        });
      }
      return child;
    });
  }, [children, localSearchTerm]);
};

export default SearchableView;
