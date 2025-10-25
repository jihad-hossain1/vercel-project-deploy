// Basic model interfaces based on Prisma schema

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT'
}

export interface Log {
  id: number;
  logType: string;
  message: string;
  details?: string;
  context?: any;
  source?: string;
  metadata?: any;
  createdAt: Date;
}

export interface Temp {
  id: number;
  jsonData?: any;
  code: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  type: string;
}

export interface Business {
  id: number;
  email: string;
  mobile?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  businessId: number;
}

export interface Employee {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  address?: string;
  departmentId?: number;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: number;
  name: string;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  address?: string;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: number;
  name: string;
  code?: string;
  description?: string;
  price: number;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  totalAmount: number;
  businessId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  id: number;
  purchaseNumber: string;
  clientId: number;
  totalAmount: number;
  businessId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Request and response interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}