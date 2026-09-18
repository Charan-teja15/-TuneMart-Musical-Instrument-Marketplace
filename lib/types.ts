export type UserRole = "buyer" | "seller" | "admin"

export type ProductCondition = "new" | "used" | "refurbished"

export type ProductCategory =
  | "Guitars"
  | "Keyboards / Pianos"
  | "Drums / Percussion"
  | "Violins / String Instruments"
  | "Wind Instruments"
  | "Traditional Instruments"
  | "Microphones / Audio Equipment"
  | "Amplifiers / Speakers"
  | "Studio Gear"
  | "Accessories"

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
  location?: string
  verified?: boolean
  createdAt: string
}

export interface Seller extends User {
  role: "seller"
  shopName?: string
  rating?: number
  totalSales?: number
  verificationStatus: "pending" | "verified" | "rejected"
  bio?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category: ProductCategory
  brand: string
  model: string
  price: number
  originalPrice?: number
  condition: ProductCondition
  quantity: number
  location: string
  description: string
  specifications: Record<string, string>
  images: string[]
  video?: string
  rating: number
  reviewCount: number
  sellerId: string
  seller: Seller
  createdAt: string
  updatedAt: string
  isApproved: boolean
  isFeatured?: boolean
  usedCondition?: UsedConditionReport
}

export interface UsedConditionReport {
  overall: "excellent" | "good" | "fair" | "poor"
  body: "excellent" | "good" | "fair" | "poor"
  neck: "excellent" | "good" | "fair" | "poor"
  strings: "excellent" | "good" | "fair" | "poor"
  electronics: "excellent" | "good" | "fair" | "poor"
  cosmetic: "excellent" | "good" | "fair" | "poor"
  damageDetails?: string
  damageImages?: string[]
  yearOfManufacture?: string
  modifications?: string
}

export interface Review {
  id: string
  productId: string
  userId: string
  user: User
  rating: number
  comment: string
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface WishlistItem {
  product: Product
  addedAt: string
}

export interface OrderStatusHistory {
  status: OrderStatus
  timestamp: string
  description: string
}

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

export interface Order {
  id: string
  userId: string
  items: { product: Product; quantity: number; price: number }[]
  subtotal: number
  shipping: number
  total: number
  shippingAddress: ShippingAddress
  status: OrderStatus
  statusHistory: OrderStatusHistory[]
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentMethod: string
  createdAt: string
  updatedAt: string
}

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  country: string
}

export type OfferStatus = "pending" | "accepted" | "rejected" | "countered" | "expired"

export interface Offer {
  id: string
  productId: string
  product: Product
  buyerId: string
  buyer: User
  sellerId: string
  amount: number
  message?: string
  status: OfferStatus
  counterAmount?: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  productId?: string
  product?: Product
  participants: User[]
  lastMessage?: Message
  messages: Message[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: ProductCategory
  slug: string
  description: string
  image: string
  productCount: number
}
