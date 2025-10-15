/**
 * Google Maps API type definitions
 */

export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
}

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GooglePlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  reviews?: GoogleReview[];
  photos?: GooglePhoto[];
  opening_hours?: {
    periods?: Array<{
      open: { day: number; time: string };
      close?: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  types?: string[];
}

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description?: string;
  text?: string;
  time: number;
}

export interface GooglePhoto {
  height: number;
  width: number;
  photo_reference: string;
  html_attributions: string[];
}

export interface GooglePlacesSearchResponse {
  results: GooglePlaceResult[];
  status: string;
  error_message?: string;
  next_page_token?: string;
}

export interface GooglePlaceDetailsResponse {
  result: GooglePlaceDetails;
  status: string;
  error_message?: string;
}
