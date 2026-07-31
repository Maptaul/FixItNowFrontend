import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

/* ---------------------------------------------------------------- *
 * Backend envelope
 *
 * Every FixItNow API response is shaped by `sendResponse` on the
 * server: `{ success, statusCode, message, data, meta? }` on success
 * and `{ success, statusCode, message, errorDetails }` on failure.
 * ---------------------------------------------------------------- */

export type IMeta = {
  page: number;
  limit: number;
  total: number;
};

export type IFieldIssue = {
  field: string;
  message: string;
};

export type IErrorDetails = {
  issues?: IFieldIssue[];
  code?: string;
} | null;

export type IApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: IMeta;
  errorDetails?: IErrorDetails;
};

/* ---------------------------------------------------------------- *
 * Enums (mirrored from the Prisma schema)
 * ---------------------------------------------------------------- */

export type IRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";
export type IActiveStatus = "ACTIVE" | "BLOCKED";

export type IBookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type IPaymentStatus = "PENDING" | "COMPLETED" | "FAILED";
export type IPaymentProvider = "STRIPE" | "SSLCOMMERZ";

/* ---------------------------------------------------------------- *
 * Domain models
 *
 * NOTE: Prisma `Decimal` columns are serialised as **strings**
 * (`"100"`, `"4.50"`). Always run them through `Number()` or the
 * helpers in `lib/format.ts` before doing maths or formatting.
 * ---------------------------------------------------------------- */

export type ICategory = {
  id: string;
  name: string;
  icon: string | null;
};

export type IUserSummary = {
  id: string;
  name: string;
  email?: string;
};

export type ITechnicianProfile = {
  id: string;
  userId: string;
  bio: string | null;
  experienceYears: number;
  hourlyRate: string;
  location: string | null;
  avgRating: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: IUserSummary;
  services?: IService[];
  reviews?: IReview[];
  slots?: IAvailabilitySlot[];
};

export type IService = {
  id: string;
  technicianId: string;
  categoryId: string;
  title: string;
  description: string | null;
  price: string;
  createdAt: string;
  updatedAt: string;
  category?: ICategory;
  technician?: ITechnicianProfile;
};

export type IAvailabilitySlot = {
  id: string;
  technicianId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
};

export type IReview = {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type IBooking = {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  scheduledAt: string;
  status: IBookingStatus;
  totalAmount: string;
  slotId: string | null;
  createdAt: string;
  updatedAt: string;
  service?: IService;
  technician?: ITechnicianProfile;
  customer?: IUserSummary;
  payment?: IPayment | null;
  review?: IReview | null;
};

export type IPayment = {
  id: string;
  bookingId: string;
  transactionId: string | null;
  amount: string;
  provider: IPaymentProvider;
  status: IPaymentStatus;
  paidAt: string | null;
  createdAt: string;
  booking?: IBooking;
};

export type IUser = {
  id: string;
  name: string;
  email: string;
  role: IRole;
  activeStatus: IActiveStatus;
  createdAt: string;
  updatedAt: string;
  technicianProfile?: ITechnicianProfile | null;
};

/** Claims carried inside the access token. */
export type IAuthUser = {
  id: string;
  name: string;
  email: string;
  role: IRole;
};

export type ICheckoutSession = {
  checkoutUrl: string | null;
  sessionId: string;
  paymentId: string;
};

export type IConfirmPaymentResult = {
  paid: boolean;
  message?: string;
  payment: IPayment;
};

/* ---------------------------------------------------------------- *
 * UI
 * ---------------------------------------------------------------- */

export type ISidebarItem = {
  label: string;
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

/** Return shape of every form server action, consumed by `useActionState`. */
export type IFormState = {
  success: boolean;
  message: string;
  /** Field-level messages keyed by input `name`, rendered inline. */
  fieldErrors?: Record<string, string>;
} | null;
