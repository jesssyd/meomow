// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

const CATS_KEY = 'meomow_cats';

/**
 * Ensure a Cat object always has:
 * - photoUris: string[] (authoritative list)
 * - photoUri:  string | undefined (latest photo for back-compat)
 */
function normalizeCat(input: Cat): Cat {
  const list =
    (input as any).photoUris && Array.isArray((input as any).photoUris)
      ? ([...(input as any).photoUris] as string[])
      : (input as any).photoUri
      ? ([(input as any).photoUri] as string[])
      : [];

  const latest = list.length ? list[list.length - 1] : undefined;

  return {
    ...input,
    // authoritative list
    photoUris: list,
    // keep single field for older screens/components that still read it
    photoUri: latest,
  } as Cat;
}

async function readAll(): Promise<Cat[]> {
  try {
    const raw = await AsyncStorage.getItem(CATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // normalize every record on read
    return parsed.map(normalizeCat);
  } catch (err) {
    console.error('Error reading cats from storage:', err);
    return [];
  }
}

async function writeAll(cats: Cat[]): Promise<void> {
  try {
    // normalize on write too, so saved shape is consistent
    const normalized = cats.map(normalizeCat);
    await AsyncStorage.setItem(CATS_KEY, JSON.stringify(normalized));
  } catch (err) {
    console.error('Error saving cats to storage:', err);
    throw err;
  }
}

export const CatStorage = {
  async getAllCats(): Promise<Cat[]> {
    return readAll();
  },

  async getCatById(id: string): Promise<Cat | null> {
    const cats = await readAll();
    const found = cats.find((c) => c.id === id);
    return found ? normalizeCat(found) : null;
  },

  async saveCat(cat: Cat): Promise<Cat> {
    const cats = await readAll();
    const normalized = normalizeCat(cat);

    const idx = cats.findIndex((c) => c.id === normalized.id);
    if (idx >= 0) {
      cats[idx] = normalized;
    } else {
      cats.push(normalized);
    }

    await writeAll(cats);
    return normalized;
  },

  async deleteCat(id: string): Promise<boolean> {
    const cats = await readAll();
    const next = cats.filter((c) => c.id !== id);
    await writeAll(next);
    return next.length !== cats.length;
  },
};