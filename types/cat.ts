export type LocationData = {
  address: string;
  coordinates?: { latitude: number; longitude: number };
};

export type Cat = {
  id: string;
  name: string;
  // legacy single photo (keep for back-compat)
  photoUri?: string;
  // new multi-photo
  photoUris?: string[];
  location: LocationData;
  breed: string;
  age: string;
  personality: string[];
  notes?: string;
  dateAdded: string;
  lastUpdated: string;
};