export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          notes: string | null;
          is_active: boolean;
          profile_id: string;
          total_credit: number;
          total_paid: number;
          balance: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          profile_id: string;
          total_credit?: number;
          total_paid?: number;
          balance?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          notes?: string | null;
          is_active?: boolean;
          profile_id?: string;
          total_credit?: number;
          total_paid?: number;
          balance?: number;
        };
      };
      transactions: {
        Row: {
          id: string;
          created_at: string;
          customer_id: string;
          amount: number;
          type: 'CREDIT' | 'PAYMENT';
          description: string | null;
          transaction_date: string;
          profile_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          customer_id: string;
          amount: number;
          type: 'CREDIT' | 'PAYMENT';
          description?: string | null;
          transaction_date?: string;
          profile_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          customer_id?: string;
          amount?: number;
          type?: 'CREDIT' | 'PAYMENT';
          description?: string | null;
          transaction_date?: string;
          profile_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_transaction: {
        Args: {
          p_customer_id: string;
          p_amount: number;
          p_type: string;
          p_description?: string;
          p_profile_id: string;
        };
        Returns: {
          id: string;
          created_at: string;
          customer_id: string;
          amount: number;
          type: string;
          description: string | null;
          transaction_date: string;
          profile_id: string;
        };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Customer = Database['public']['Tables']['customers']['Row'];
export type NewCustomer = Database['public']['Tables']['customers']['Insert'];
export type UpdateCustomer = Database['public']['Tables']['customers']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type NewTransaction = Database['public']['Tables']['transactions']['Insert'];
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update'];
