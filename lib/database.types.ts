export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          total_credit: number;
          total_paid: number;
          balance: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
          profile_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          total_credit?: number;
          total_paid?: number;
          balance?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          profile_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          total_credit?: number;
          total_paid?: number;
          balance?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          profile_id?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          customer_id: string;
          amount: number;
          type: 'CREDIT' | 'PAYMENT';
          description: string | null;
          transaction_date: string;
          created_at: string;
          profile_id: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          amount: number;
          type: 'CREDIT' | 'PAYMENT';
          description?: string | null;
          transaction_date?: string;
          created_at?: string;
          profile_id: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          amount?: number;
          type?: 'CREDIT' | 'PAYMENT';
          description?: string | null;
          transaction_date?: string;
          created_at?: string;
          profile_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
