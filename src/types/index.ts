export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "MANAGER"
  | "STYLIST"
  | "RECEPTIONIST"
  | "CUSTOMER";

export type GenderType = "UNISEX" | "FEMALE" | "MALE" | "KIDS";

export type AppointmentStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}

export interface SalonServiceSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  discountedPrice?: number | null;
  durationMinutes: number;
  gender: GenderType;
  categoryName?: string;
  imageUrl?: string | null;
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
}
