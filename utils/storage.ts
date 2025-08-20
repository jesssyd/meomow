import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

const CATS_KEY = 'meomow_cats';

async function readAll(): Promise<Cat[]> {
  try {
    const raw = await AsyncStorage.getItem(CATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error reading cats from storage:', error);
    return [];
  }
}

async function writeAll(cats: Cat[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CATS_KEY, JSON.stringify(cats));
    console.log('Successfully saved cats to AsyncStorage');
  } catch (error) {
    console.error('Error saving cats to storage:', error);
    throw error;
  }
}

export const CatStorage = {
  async getAllCats(): Promise<Cat[]> {
    return readAll();
  },

  async getCatById(id: string): Promise<Cat | null> {
    const cats = await readAll();
    return cats.find(c => c.id === id) ?? null;
  },

  async saveCat(cat: Cat): Promise<Cat> {
    console.log('Attempting to save cat:', cat.name);
    const cats = await readAll();
    const existingIndex = cats.findIndex(c => c.id === cat.id);
    
    if (existingIndex >= 0) {
      console.log('Updating existing cat');
      cats[existingIndex] = cat;
    } else {
      console.log('Adding new cat');
      cats.push(cat);
    }
    
    await writeAll(cats);
    return cat;
  },

  async deleteCat(id: string): Promise<boolean> {
    const cats = await readAll();
    const filteredCats = cats.filter(c => c.id !== id);
    await writeAll(filteredCats);
    return filteredCats.length !== cats.length;
  },
};