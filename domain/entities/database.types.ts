// =====================================================
// Database Types - Generated from Supabase Schema
// =====================================================

export type UserRole = 'admin' | 'operator'

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

// =====================================================
// Tables
// =====================================================

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
  created_by: string | null
}

export interface Product {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Color {
  id: string
  product_id: string
  name: string
  notes: string | null
  image_url: string | null
  active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Ingredient {
  id: string
  name: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

export interface Formula {
  id: string
  color_id: string
  version: number
  base_total_g: number
  is_active: boolean
  notes: string | null
  created_at: string
  created_by: string | null
}

export interface FormulaItem {
  id: string
  formula_id: string
  ingredient_id: string
  quantity_g: number
  position: number
}

export interface Batch {
  id: string
  formula_id: string
  target_total_g: number
  scale_factor: number
  observations: string | null
  created_at: string
  created_by: string | null
}

export interface BatchItem {
  id: string
  batch_id: string
  ingredient_id: string
  ingredient_name: string
  quantity_g: number
  position: number
}

export interface AuditLog {
  id: string
  table_name: string
  record_id: string
  action: AuditAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user_id: string | null
  created_at: string
}

// =====================================================
// Database Schema
// =====================================================

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: UserRoleRecord
        Insert: Omit<UserRoleRecord, 'id' | 'created_at'>
        Update: Partial<Omit<UserRoleRecord, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      colors: {
        Row: Color
        Insert: Omit<Color, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Color, 'id' | 'created_at' | 'updated_at'>>
      }
      ingredients: {
        Row: Ingredient
        Insert: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>>
      }
      formulas: {
        Row: Formula
        Insert: Omit<Formula, 'id' | 'created_at'>
        Update: Partial<Omit<Formula, 'id' | 'created_at'>>
      }
      formula_items: {
        Row: FormulaItem
        Insert: Omit<FormulaItem, 'id'>
        Update: Partial<Omit<FormulaItem, 'id'>>
      }
      batches: {
        Row: Batch
        Insert: Omit<Batch, 'id' | 'created_at'>
        Update: Partial<Omit<Batch, 'id' | 'created_at'>>
      }
      batch_items: {
        Row: BatchItem
        Insert: Omit<BatchItem, 'id'>
        Update: Partial<Omit<BatchItem, 'id'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'created_at'>
        Update: never // Audit logs are immutable
      }
    }
  }
}
