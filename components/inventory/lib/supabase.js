// ============== CLIENT SUPABASE ==============
// Configuration du client Supabase pour l'application

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[SET]' : '[MISSING]');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Helper functions pour l'API

// ============== ITEMS ==============
export const itemsAPI = {
  // Récupérer tous les articles
  async getAll() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        item_locations (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer un article par ID
  async getById(id) {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        item_locations (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Créer un nouvel article
  async create(item) {
    const { locations, ...itemData } = item;

    // Insérer l'article
    const { data: newItem, error: itemError } = await supabase
      .from('items')
      .insert([itemData])
      .select()
      .single();

    if (itemError) throw itemError;

    // Insérer les localisations
    if (locations && locations.length > 0) {
      const locationsData = locations.map(loc => ({
        ...loc,
        item_id: newItem.id
      }));

      const { error: locError } = await supabase
        .from('item_locations')
        .insert(locationsData);

      if (locError) throw locError;
    }

    return newItem;
  },

  // Mettre à jour un article
  async update(id, updates) {
    const { locations, ...itemUpdates } = updates;

    // Mettre à jour l'article
    const { data, error } = await supabase
      .from('items')
      .update(itemUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Mettre à jour les localisations si fournies
    if (locations) {
      // Supprimer les anciennes localisations
      await supabase
        .from('item_locations')
        .delete()
        .eq('item_id', id);

      // Insérer les nouvelles
      if (locations.length > 0) {
        const locationsData = locations.map(loc => ({
          ...loc,
          item_id: id
        }));

        await supabase
          .from('item_locations')
          .insert(locationsData);
      }
    }

    return data;
  },

  // Supprimer un article
  async delete(id) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Mettre à jour la quantité d'une localisation
  async updateQuantity(itemId, department, newQuantity) {
    const { data, error } = await supabase
      .from('item_locations')
      .update({ quantity: newQuantity })
      .eq('item_id', itemId)
      .eq('department', department)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============== DEPARTMENTS ==============
export const departmentsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async create(department) {
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ============== CATEGORIES ==============
export const categoriesAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ============== MOVEMENTS ==============
export const movementsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('movements')
      .select('*, items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(movement) {
    const { data, error } = await supabase
      .from('movements')
      .insert([movement])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// ============== USERS ==============
export const usersAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');

    if (error) throw error;
    return data;
  },

  async getByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  },

  async create(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export default supabase;
