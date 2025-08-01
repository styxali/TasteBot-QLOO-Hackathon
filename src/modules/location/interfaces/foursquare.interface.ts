export interface FoursquareVenuePhoto {
  id: string;
  prefix: string;
  suffix: string;
  width?: number;
  height?: number;
}

export interface FoursquareVenueHours {
  display?: string;
  open_now?: boolean;
  regular?: Array<{
    day: number;
    open: string;
    close: string;
  }>;
}

export interface FoursquareVenueCategory {
  id: number;
  name: string;
  icon: {
    prefix: string;
    suffix: string;
  };
}

export interface FoursquareVenueLocation {
  address?: string;
  locality?: string;
  region?: string;
  country?: string;
  formatted_address?: string;
}

export interface FoursquareVenue {
  fsq_id: string;
  name: string;
  location: FoursquareVenueLocation;
  categories: FoursquareVenueCategory[];
  distance?: number;
  rating?: number;
  price?: number;
  photos?: FoursquareVenuePhoto[];
  hours?: FoursquareVenueHours;
  tel?: string;
  website?: string;
  description?: string;
}

export interface FoursquareSearchResponse {
  results: FoursquareVenue[];
  context?: {
    geo_bounds?: {
      circle: {
        center: {
          latitude: number;
          longitude: number;
        };
        radius: number;
      };
    };
  };
}
