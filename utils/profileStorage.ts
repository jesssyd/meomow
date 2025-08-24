// utils/profileStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile } from '@/types/profile';
import uuid from 'react-native-uuid';

const PROFILES_KEY = 'meomow_profiles';
const CURRENT_PROFILE_KEY = 'meomow_current_profile';

async function readAllProfiles(): Promise<Profile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('error reading profiles:', err);
    return [];
  }
}

async function writeAllProfiles(profiles: Profile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('error saving profiles:', err);
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
      console.error('error getting current profile:', err);
      return null;
    }
  },

  async setCurrentProfile(profileId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(CURRENT_PROFILE_KEY, profileId);
      
      // update last active timestamp
      const profiles = await readAllProfiles();
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        profile.lastActive = new Date().toISOString();
        await writeAllProfiles(profiles);
      }
    } catch (err) {
      console.error('error setting current profile:', err);
      throw err;
    }
  },

  // add optional profileImageUri arg, deprecate color and emoji
  async createProfile(username: string, displayName?: string, profileImageUri?: string): Promise<Profile> {
    try {
      const profiles = await readAllProfiles();
      
      // check if username already exists
      const existing = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        throw new Error('username already exists');
      }

      const now = new Date().toISOString();
      // keep backward compatibility by including empty strings for old fields
      const newProfile: Profile = {
        id: uuid.v4() as string,
        username: username.trim(),
        displayName: displayName?.trim() || username.trim(),
        // legacy fields retained but unused by UI
        profileColor: '',
        profileEmoji: '',
        dateCreated: now,
        lastActive: now,
        totalCatsFound: 0,
        favoritePersonalityTraits: [],
      };

      // store new optional image field alongside the profile
      (newProfile as any).profileImageUri = profileImageUri;

      profiles.push(newProfile);
      await writeAllProfiles(profiles);
      await this.setCurrentProfile(newProfile.id);
      
      return newProfile;
    } catch (err) {
      console.error('error creating profile:', err);
      throw err;
    }
  },

  // allow updating optional image field
  async updateProfile(profileId: string, updates: Partial<Profile> & { profileImageUri?: string }): Promise<Profile> {
    try {
      const profiles = await readAllProfiles();
      const index = profiles.findIndex(p => p.id === profileId);
      
      if (index === -1) {
        throw new Error('profile not found');
      }

      profiles[index] = { ...profiles[index], ...updates } as Profile;
      await writeAllProfiles(profiles);
      
      return profiles[index];
    } catch (err) {
      console.error('error updating profile:', err);
      throw err;
    }
  },

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      const profiles = await readAllProfiles();
      const filtered = profiles.filter(p => p.id !== profileId);
      
      if (filtered.length === profiles.length) {
        return false;
      }

      await writeAllProfiles(filtered);
      
      // if this was the current profile, clear it
      const currentId = await AsyncStorage.getItem(CURRENT_PROFILE_KEY);
      if (currentId === profileId) {
        await AsyncStorage.removeItem(CURRENT_PROFILE_KEY);
      }
      
      return true;
    } catch (err) {
      console.error('error deleting profile:', err);
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
      console.error('error incrementing cat count:', err);
    }
  },
};
