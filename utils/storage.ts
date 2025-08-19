import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cat } from '@/types/cat';

const CATS_STORAGE_KEY = '@meomow_cats';

export class CatStorage {
  static async getAllCats(): Promise<Cat[]> {
    try {
      const catsData = await AsyncStorage.getItem(CATS_STORAGE_KEY);
      if (catsData) {
        return JSON.parse(catsData);
      }
      return [];
    } catch (error) {
      console.error('Error retrieving cats:', error);
      return [];
    }
  }

  static async saveCat(cat: Cat): Promise<boolean> {
    try {
      const existingCats = await this.getAllCats();
      const catIndex = existingCats.findIndex(c => c.id === cat.id);
      
      if (catIndex >= 0) {
        // Update existing cat
        existingCats[catIndex] = cat;
      } else {
        // Add new cat
        existingCats.push(cat);
      }

      await AsyncStorage.setItem(CATS_STORAGE_KEY, JSON.stringify(existingCats));
      return true;
    } catch (error) {
      console.error('Error saving cat:', error);
      return false;
    }
  }

  static async deleteCat(catId: string): Promise<boolean> {
    try {
      const existingCats = await this.getAllCats();
      const filteredCats = existingCats.filter(cat => cat.id !== catId);
      await AsyncStorage.setItem(CATS_STORAGE_KEY, JSON.stringify(filteredCats));
      return true;
    } catch (error) {
      console.error('Error deleting cat:', error);
      return false;
    }
  }

  static async getCatById(catId: string): Promise<Cat | null> {
    try {
      const cats = await this.getAllCats();
      return cats.find(cat => cat.id === catId) || null;
    } catch (error) {
      console.error('Error retrieving cat by ID:', error);
      return null;
    }
  }
}