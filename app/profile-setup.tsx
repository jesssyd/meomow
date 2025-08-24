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
