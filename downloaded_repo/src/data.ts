export interface Attraction {
  id: string;
  name: string;
  categories: string[];
  contextTags?: string[];
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
  hours?: string;
  ticketInfo?: string;
}
