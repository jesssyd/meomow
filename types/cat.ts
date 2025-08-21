// types/cat.ts
export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type LocationData = {
  address: string;
  coordinates?: Coordinates;
};

export type Cat = {
  id: string;
  name: string;
  // multi-photo: newest at the end of the array
  photoUris: string[];

  location: LocationData;
  breed: string;
  age: string;
  personality: string[];
  notes?: string;
  dateAdded: string;   // ISO
  lastUpdated: string; // ISO
};
