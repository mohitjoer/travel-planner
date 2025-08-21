export interface Activity {
  name: string;
  description: string;
  date: string;
}

export interface Itinerary {
  id?: string;
  userId: string;
  title: string;
  destination: string;
  tripType: "Adventure" | "Leisure" | "Work" | string;
  activities: Activity[];
  photos: string[];
  createdAt?: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  favorites?: string[];
}
