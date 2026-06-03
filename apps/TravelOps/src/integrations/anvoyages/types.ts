export interface AnVoyagesLocation {
  id: string;
  name: string;
  nameVi?: string | null;
  nameEn?: string | null;
  slug?: string | null;
  description?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  imageUrl?: string | null;
  seoTitleVi?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionVi?: string | null;
  seoDescriptionEn?: string | null;
}

export interface AnVoyagesProperty {
  id: string;
  name: string;
  nameVi?: string | null;
  nameEn?: string | null;
  locationId: string;
  supplierId?: string | null;
  type: string;
  description?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  durationDays?: number | null;
  costPrice?: number | null;
  basePrice: number;
  adultPrice?: number | null;
  childPrice?: number | null;
  extraFee?: number | null;
  pricingRules?: string | null;
  isActive?: boolean | null;
  images?: string | null;
  amenities?: string | null;
  amenitiesVi?: string | null;
  amenitiesEn?: string | null;
  maxGuests?: number | null;
  seoTitleVi?: string | null;
  seoTitleEn?: string | null;
  seoDescriptionVi?: string | null;
  seoDescriptionEn?: string | null;
  seoKeywordsVi?: string | null;
  seoKeywordsEn?: string | null;
}

export interface AnVoyagesProductOption {
  id: string;
  propertyId: string;
  optionType?: string | null;
  name: string;
  nameVi?: string | null;
  nameEn?: string | null;
  description?: string | null;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  basePrice: number;
  adultPrice?: number | null;
  childPrice?: number | null;
  costPrice?: number | null;
  maxGuests?: number | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  inventoryQuantity?: number | null;
  durationDays?: number | null;
  pricingRules?: string | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
}

export interface AnVoyagesCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  notes?: string | null;
}

export interface AnVoyagesBooking {
  id: string;
  bookingCode?: string | null;
  customerId?: string | null;
  customerName: string;
  phone: string;
  email?: string | null;
  locationId: string;
  propertyId?: string | null;
  productOptionId?: string | null;
  productOptionName?: string | null;
  productOptionType?: string | null;
  productOptionPrice?: number | null;
  productOptionDurationDays?: number | null;
  productOptionQuantity?: number | null;
  checkIn: string | Date;
  checkOut: string | Date;
  guests?: number | null;
  adultCount?: number | null;
  childCount?: number | null;
  totalCost?: number | null;
  totalPrice: number;
  profit?: number | null;
  depositAmount?: number | null;
  depositPercent?: number | null;
  discountCode?: string | null;
  paidAmount?: number | null;
  bookingIntent?: string | null;
  requestedPaymentMethod?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  transferContent?: string | null;
  status?: string | null;
  note?: string | null;
  adminNote?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
}

export interface AnVoyagesSupplier {
  id: string;
  name: string;
  type: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contractRate?: string | null;
  notes?: string | null;
}

export interface AnVoyagesPayment {
  id: string;
  bookingId: string;
  amount: number;
  method?: string | null;
  type?: string | null;
  referenceCode?: string | null;
  transferContent?: string | null;
  note?: string | null;
  createdAt?: string | Date | null;
}

export interface AnVoyagesSnapshot {
  locations?: AnVoyagesLocation[];
  properties?: AnVoyagesProperty[];
  productOptions?: AnVoyagesProductOption[];
  customers?: AnVoyagesCustomer[];
  bookings?: AnVoyagesBooking[];
  suppliers?: AnVoyagesSupplier[];
  payments?: AnVoyagesPayment[];
}
