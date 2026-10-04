export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "free" | "starter" | "pro" | "enterprise";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: "free" | "starter" | "pro" | "enterprise";
          created_at?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: "owner" | "admin" | "member";
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: "owner" | "admin" | "member";
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          brand_id: string | null;
          category_id: string | null;
          model: string | null;
          ean: string | null;
          upc: string | null;
          sku: string | null;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          brand_id?: string | null;
          category_id?: string | null;
          model?: string | null;
          ean?: string | null;
          upc?: string | null;
          sku?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          brand_id?: string | null;
          category_id?: string | null;
          model?: string | null;
          ean?: string | null;
          upc?: string | null;
          sku?: string | null;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      merchants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          source_id: string;
          base_url: string;
          trust_score: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          source_id: string;
          base_url: string;
          trust_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          source_id?: string;
          base_url?: string;
          trust_score?: number;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          product_id: string;
          merchant_id: string | null;
          source: string;
          merchant_name: string;
          url: string;
          current_price_paise: number;
          original_price_paise: number | null;
          in_stock: boolean;
          provenance: Json;
          last_observed_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          merchant_id?: string | null;
          source: string;
          merchant_name: string;
          url: string;
          current_price_paise: number;
          original_price_paise?: number | null;
          in_stock?: boolean;
          provenance: Json;
          last_observed_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          merchant_id?: string | null;
          source?: string;
          merchant_name?: string;
          url?: string;
          current_price_paise?: number;
          original_price_paise?: number | null;
          in_stock?: boolean;
          provenance?: Json;
          last_observed_at?: string;
        };
      };
      price_observations: {
        Row: {
          id: string;
          offer_id: string;
          product_id: string;
          price_paise: number;
          in_stock: boolean;
          recorded_at: string;
          provenance: Json;
        };
        Insert: {
          id?: string;
          offer_id: string;
          product_id: string;
          price_paise: number;
          in_stock?: boolean;
          recorded_at?: string;
          provenance: Json;
        };
        Update: {
          id?: string;
          offer_id?: string;
          product_id?: string;
          price_paise?: number;
          in_stock?: boolean;
          recorded_at?: string;
          provenance?: Json;
        };
      };
      alerts: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          product_id: string;
          target_price_paise: number;
          channels: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          product_id: string;
          target_price_paise: number;
          channels?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          product_id?: string;
          target_price_paise?: number;
          channels?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      extraction_tasks: {
        Row: {
          id: string;
          workspace_id: string;
          url: string;
          schema: Json;
          status: "pending" | "running" | "completed" | "failed";
          result: Json | null;
          error: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          url: string;
          schema: Json;
          status?: "pending" | "running" | "completed" | "failed";
          result?: Json | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          url?: string;
          schema?: Json;
          status?: "pending" | "running" | "completed" | "failed";
          result?: Json | null;
          error?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes: Json;
          created_at: string;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes?: Json;
          created_at?: string;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          key_hash?: string;
          key_prefix?: string;
          scopes?: Json;
          created_at?: string;
          expires_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
