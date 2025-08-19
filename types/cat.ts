export interface Cat {
  id: string;
  name: string;
  photoUri: string;
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  breed: string;
  age: string;
  personality: string[];
  notes?: string;
  dateAdded: string;
  lastUpdated: string;
}

export interface LocationData {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}