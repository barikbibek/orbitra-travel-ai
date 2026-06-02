export interface User {
  id:    string;
  name:  string;
  email: string;
}

export interface DayPlan {
  day:            number;
  date:           string;
  location:       string;
  activities:     string[];
  accommodation?: string;
  transport?:     string;
  notes?:         string;
}

export interface Itinerary {
  _id:         string;
  title:       string;
  destination: string;
  startDate:   string;
  endDate:     string;
  days:        DayPlan[];
  isShared:    boolean;
  shareToken:  string;
  createdAt:   string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  message?: string;
}