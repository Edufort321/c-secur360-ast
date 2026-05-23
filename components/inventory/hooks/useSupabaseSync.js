// ============== HOOK DE SYNCHRONISATION SUPABASE ==============
// Synchronise localStorage avec Supabase pour avoir le meilleur des deux mondes

import { useEffect, useCallback, useRef } from 'react';
import { supabase, itemsAPI, departmentsAPI, categoriesAPI, movementsAPI } from '../lib/supabase';

export function useSupabaseSync() {
  const syncInProgress = useRef(false);

  // Charger les données initiales depuis Supabase
  const loadFromSupabase = useCallback(async () => {
    if (syncInProgress.current) return;
    syncInProgress.current = true;

    try {
      console.log('🔄 Chargement des données depuis Supabase...');

      // Charger les départements
      const departments = await departmentsAPI.getAll();
      if (departments) {
        localStorage.setItem('c-secur360-inventory-departments', JSON.stringify(departments));
      }

      // Charger les catégories
      const categories = await categoriesAPI.getAll();
      if (categories) {
        localStorage.setItem('c-secur360-inventory-categories', JSON.stringify(categories));
      }

      // Charger les articles avec leurs localisations
      const items = await itemsAPI.getAll();
      if (items) {
        // Transformer le format Supabase vers le format localStorage
        const transformedItems = items.map(item => ({
          ...item,
          locations: item.item_locations || []
        }));
        localStorage.setItem('c-secur360-inventory-items', JSON.stringify(transformedItems));
      }

      console.log('✅ Données chargées depuis Supabase');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du chargement depuis Supabase:', error);
      return false;
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  // Synchroniser un article vers Supabase
  const syncItemToSupabase = useCallback(async (item, action = 'upsert') => {
    try {
      if (action === 'delete') {
        await itemsAPI.delete(item.id);
      } else if (action === 'create') {
        await itemsAPI.create(item);
      } else {
        // Update
        await itemsAPI.update(item.id, item);
      }
      console.log(`✅ Article ${action} synchronisé:`, item.name);
    } catch (error) {
      console.error(`❌ Erreur sync article ${action}:`, error);
    }
  }, []);

  // Synchroniser un département vers Supabase
  const syncDepartmentToSupabase = useCallback(async (department, action = 'upsert') => {
    try {
      if (action === 'delete') {
        await departmentsAPI.delete(department.id);
      } else if (action === 'create') {
        await departmentsAPI.create(department);
      } else {
        await departmentsAPI.update(department.id, department);
      }
      console.log(`✅ Département ${action} synchronisé:`, department.name);
    } catch (error) {
      console.error(`❌ Erreur sync département ${action}:`, error);
    }
  }, []);

  // Synchroniser une catégorie vers Supabase
  const syncCategoryToSupabase = useCallback(async (category, action = 'upsert') => {
    try {
      if (action === 'delete') {
        await categoriesAPI.delete(category.id);
      } else if (action === 'create') {
        await categoriesAPI.create(category);
      } else {
        await categoriesAPI.update(category.id, category);
      }
      console.log(`✅ Catégorie ${action} synchronisée:`, category.name);
    } catch (error) {
      console.error(`❌ Erreur sync catégorie ${action}:`, error);
    }
  }, []);

  // Synchroniser un mouvement vers Supabase
  const syncMovementToSupabase = useCallback(async (movement) => {
    try {
      await movementsAPI.create(movement);
      console.log('✅ Mouvement synchronisé');
    } catch (error) {
      console.error('❌ Erreur sync mouvement:', error);
    }
  }, []);

  // Souscription temps réel pour les items
  const subscribeToItems = useCallback((onItemChange) => {
    const channel = supabase
      .channel('items-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        async (payload) => {
          console.log('🔔 Changement détecté sur items:', payload);

          if (payload.eventType === 'INSERT') {
            const newItem = payload.new;
            onItemChange({ type: 'INSERT', item: newItem });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new;
            onItemChange({ type: 'UPDATE', item: updatedItem });
          } else if (payload.eventType === 'DELETE') {
            const deletedItem = payload.old;
            onItemChange({ type: 'DELETE', item: deletedItem });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Souscription temps réel pour les départements
  const subscribeToDepartments = useCallback((onDepartmentChange) => {
    const channel = supabase
      .channel('departments-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'departments' },
        (payload) => {
          console.log('🔔 Changement détecté sur departments:', payload);

          if (payload.eventType === 'INSERT') {
            onDepartmentChange({ type: 'INSERT', department: payload.new });
          } else if (payload.eventType === 'UPDATE') {
            onDepartmentChange({ type: 'UPDATE', department: payload.new });
          } else if (payload.eventType === 'DELETE') {
            onDepartmentChange({ type: 'DELETE', department: payload.old });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Souscription temps réel pour les catégories
  const subscribeToCategories = useCallback((onCategoryChange) => {
    const channel = supabase
      .channel('categories-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('🔔 Changement détecté sur categories:', payload);

          if (payload.eventType === 'INSERT') {
            onCategoryChange({ type: 'INSERT', category: payload.new });
          } else if (payload.eventType === 'UPDATE') {
            onCategoryChange({ type: 'UPDATE', category: payload.new });
          } else if (payload.eventType === 'DELETE') {
            onCategoryChange({ type: 'DELETE', category: payload.old });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    loadFromSupabase,
    syncItemToSupabase,
    syncDepartmentToSupabase,
    syncCategoryToSupabase,
    syncMovementToSupabase,
    subscribeToItems,
    subscribeToDepartments,
    subscribeToCategories
  };
}

export default useSupabaseSync;
