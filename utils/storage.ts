import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

const CATS_KEY = 'meomow_cats';

function normalize(cat: Cat): Cat {
  const photos = (cat.photoUris && cat.photoUris.length ? cat.photoUris : (cat.photoUri ? [cat.photoUri] : []));
  // Always write both for back-compat: photoUris (authoritative) and photoUri (latest)
  const latest = photos.length ? photos[photos.length - 1] : undefined;
  return { ...cat, photoUris: photos, photoUri: latest };
}

async function readAll(): Promise<Cat[]> {
  try {
    const raw = await AsyncStorage.getItem(CATS_KEY);
    const parsed: Cat[] = raw ? JSON.parse(raw) : [];
    return parsed.map(normalize);
  } catch (error) {
    console.error('Error reading cats from storage:', error);
    return [];
  }
}

async function writeAll(cats: Cat[]): Promise<void> {
  try {
    const normalized = cats.map(normalize);
    await AsyncStorage.setItem(CATS_KEY, JSON.stringify(normalized));
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
    const cats = await readAll();
    const next = normalize(cat);
    const i = cats.findIndex(c => c.id === next.id);
    if (i >= 0) cats[i] = next; else cats.push(next);
    await writeAll(cats);
    return next;
  },

  async deleteCat(id: string): Promise<boolean> {
    const cats = await readAll();
    const filtered = cats.filter(c => c.id !== id);
    await writeAll(filtered);
    return filtered.length !== cats.length;
  },
};