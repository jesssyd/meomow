import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types/profile';
import uuid from 'react-native-uuid';

const PROFILES_KEY = 'meomow_profiles';
const CURRENT_PROFILE_KEY = 'meomow_current_profile';

const PROFILE_COLORS = [
  '#FFB6C1', '#98FB98', '#87CEEB', '#DDA0DD', '#F0E68C', 
  '#FFA07A', '#20B2AA', '#FF69B4', '#32CD32', '#FF6347'
];

const PROFILE_EMOJIS = ['😸', '😺', '😻', '😽', '🙀', '😿', '😾', '🐱', '🐈', '🐈‍⬛'];

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

async function readAllProfiles(): Promise<Profile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading profiles:', err);
    return [];
  }
}

async function writeAllProfiles(profiles: Profile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Error saving profiles:', err);
    throw err;
  }
}

export const ProfileStorage = {
  async getAllProfiles(): Promise<Profile[]> {
    return readAllProfiles();
  },

  async getCurrentProfile(): Promise<Profile | null> {
    try {
      const currentId = await AsyncStorage.getItem(CURRENT_PROFILE_KEY);
      if (!currentId) return null;
      
      const profiles = await readAllProfiles();
      return profiles.find(p => p.id === currentId) || null;
    } catch (err) {
      console.error('Error getting current profile:', err);
      return null;
    }
  },

  async setCurrentProfile(profileId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_PROFILE_KEY, profileId);
      
      // Update last active timestamp
      const profiles = await readAllProfiles();
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        profile.lastActive = new Date().toISOString();
        await writeAllProfiles(profiles);
      }
    } catch (err) {
      console.error('Error setting current profile:', err);
      throw err;
    }
  },

  async createProfile(username: string, displayName?: string): Promise<Profile> {
    try {
      const profiles = await readAllProfiles();
      
      // Check if username already exists
      const existing = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        throw new Error('Username already exists');
      }

      const now = new Date().toISOString();
      const newProfile: Profile = {
        id: uuid.v4() as string,
        username: username.trim(),
        displayName: displayName?.trim() || username.trim(),
        profileColor: getRandomItem(PROFILE_COLORS),
        profileEmoji: getRandomItem(PROFILE_EMOJIS),
        dateCreated: now,
        lastActive: now,
        totalCatsFound: 0,
        favoritePersonalityTraits: [],
      };

      profiles.push(newProfile);
      await writeAllProfiles(profiles);
      await this.setCurrentProfile(newProfile.id);
      
      return newProfile;
    } catch (err) {
      console.error('Error creating profile:', err);
      throw err;
    }
  },

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile> {
    try {
      const profiles = await readAllProfiles();
      const index = profiles.findIndex(p => p.id === profileId);
      
      if (index === -1) {
        throw new Error('Profile not found');
      }

      profiles[index] = { ...profiles[index], ...updates };
      await writeAllProfiles(profiles);
      
      return profiles[index];
    } catch (err) {
      console.error('Error updating profile:', err);
      throw err;
    }
  },

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      const profiles = await readAllProfiles();
      const filtered = profiles.filter(p => p.id !== profileId);
      
      if (filtered.length === profiles.length) {
        return false; // Profile not found
      }

      await writeAllProfiles(filtered);
      
      // If this was the current profile, clear it
      const currentId = await AsyncStorage.getItem(CURRENT_PROFILE_KEY);
      if (currentId === profileId) {
        await AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting profile:', err);
      throw err;
    }
  },

  async incrementCatCount(profileId: string): Promise<void> {
    try {
      const profiles = await readAllProfiles();
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        profile.totalCatsFound += 1;
        profile.lastActive = new Date().toISOString();
        await writeAllProfiles(profiles);
      }
    } catch (err) {
      console.error('Error incrementing cat count:', err);
    }
  },
};