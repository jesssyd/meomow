export type Profile = {
  id: string;
  username: string;
  displayName: string;
  profileColor: string;
  dateCreated: string;
  lastActive: string;
  totalCatsFound: number;
  favoritePersonalityTraits: string[];
  profileEmoji: string;
};

export type ProfileStats = {
  totalCats: number;
  mostRecentDiscovery?: string;
  favoritePersonalityTraits: string[];
  discoveryStreak: number;
  averageCatsPerMonth: number;
};