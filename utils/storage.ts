// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

const CATS_KEY = 'meomow_cats';

function migrateCat(raw: any): Cat {
  // handle legacy single-photo structure
  const photoUris: string[] = Array.isArray(raw?.photoUris)
    ? raw.photoUris
    : raw?.photoUri
      ? [raw.photoUri]
      : [];

  return {
    id: String(raw.id),
    name: typeof raw.name === 'string' ? raw.name : '???',
    photoUris,
    location: raw.location ?? { address: 'Unknown location' },
    breed: typeof raw.breed === 'string' ? raw.breed : 'Unknown',
    age: typeof raw.age === 'string' ? raw.age : 'Unknown',
    personality: Array.isArray(raw.personality) ? raw.personality : [],
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    dateAdded: raw.dateAdded ?? new Date().toISOString(),
    lastUpdated: raw.lastUpdated ?? new Date().toISOString(),
  };
}

async function readAll(): Promise<Cat[]> {
  try {
    const raw = await AsyncStorage.getItem(CATS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(migrateCat) : [];
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
    return cats.find((c) => c.id === id) ?? null;
  },

  async saveCat(cat: Cat): Promise<Cat> {
    const cats = await readAll();
    const idx = cats.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      cats[idx] = cat;
    } else {
      cats.push(cat);
    }
    await writeAll(cats);
    return cat;
  },

  async deleteCat(id: string): Promise<boolean> {
    const cats = await readAll();
    const filtered = cats.filter((c) => c.id !== id);
    await writeAll(filtered);
    return filtered.length !== cats.length;
  },
};
