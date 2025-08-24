import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

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

function getCatsKey(profileId: string): string {
  return `meomow_cats_${profileId}`;
}

async function readAllForProfile(profileId: string): Promise<Cat[]> {
  try {
    const key = getCatsKey(profileId);
    const raw = await AsyncStorage.getItem(key);
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

async function writeAllForProfile(profileId: string, cats: Cat[]): Promise<void> {
  try {
    // normalize on write too, so saved shape is consistent
    const normalized = cats.map(normalizeCat);
    const key = getCatsKey(profileId);
    await AsyncStorage.setItem(key, JSON.stringify(normalized));
  } catch (err) {
    console.error('Error saving cats to storage:', err);
    throw err;
  }
}

export const CatStorage = {
  async getAllCats(profileId: string): Promise<Cat[]> {
    return readAllForProfile(profileId);
  },

  async getCatById(profileId: string, id: string): Promise<Cat | null> {
    const cats = await readAllForProfile(profileId);
    const found = cats.find((c) => c.id === id);
    return found ? normalizeCat(found) : null;
  },

  async saveCat(profileId: string, cat: Cat): Promise<Cat> {
    const cats = await readAllForProfile(profileId);
    const normalized = normalizeCat(cat);

    const idx = cats.findIndex((c) => c.id === normalized.id);
    if (idx >= 0) {
      cats[idx] = normalized;
    } else {
      cats.push(normalized);
    }

    await writeAllForProfile(profileId, cats);
    return normalized;
  },

  async deleteCat(profileId: string, id: string): Promise<boolean> {
    const cats = await readAllForProfile(profileId);
    const next = cats.filter((c) => c.id !== id);
    await writeAllForProfile(profileId, next);
    return next.length !== cats.length;
  },
};