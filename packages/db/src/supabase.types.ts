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
      saved_searches: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          query: string;
          filters: Json;
          notify_on_new: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          query: string;
          filters?: Json;
          notify_on_new?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          query?: string;
          filters?: Json;
          notify_on_new?: boolean;
          created_at?: string;
        };
      };
      team_invitations: {
        Row: {
          id: string;
          workspace_id: string;
          email: string;
          role: "admin" | "member";
          token: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          email: string;
          role?: "admin" | "member";
          token: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          email?: string;
          role?: "admin" | "member";
          token?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      webhooks: {
        Row: {
          id: string;
          workspace_id: string;
          target_url: string;
          secret_hash: string;
          events: Json;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          target_url: string;
          secret_hash: string;
          events?: Json;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          target_url?: string;
          secret_hash?: string;
          events?: Json;
          is_active?: boolean;
          created_at?: string;
        };
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_id: string;
          workspace_id: string;
          event_type: string;
          payload: Json;
          response_status: number | null;
          signature: string;
          latency_ms: number | null;
          delivered_at: string;
        };
        Insert: {
          id?: string;
          webhook_id: string;
          workspace_id: string;
          event_type: string;
          payload: Json;
          response_status?: number | null;
          signature: string;
          latency_ms?: number | null;
          delivered_at?: string;
        };
        Update: {
          id?: string;
          webhook_id?: string;
          workspace_id?: string;
          event_type?: string;
          payload?: Json;
          response_status?: number | null;
          signature?: string;
          latency_ms?: number | null;
          delivered_at?: string;
        };
      };
      extract_runs: {
        Row: {
          id: string;
          workspace_id: string;
          template_id: string | null;
          status: "running" | "completed" | "failed";
          records_extracted: number;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          template_id?: string | null;
          status?: "running" | "completed" | "failed";
          records_extracted?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          template_id?: string | null;
          status?: "running" | "completed" | "failed";
          records_extracted?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      extract_run_logs: {
        Row: {
          id: string;
          run_id: string;
          workspace_id: string;
          level: "debug" | "info" | "warn" | "error";
          message: string;
          meta: Json | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          workspace_id: string;
          level: "debug" | "info" | "warn" | "error";
          message: string;
          meta?: Json | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          workspace_id?: string;
          level?: "debug" | "info" | "warn" | "error";
          message?: string;
          meta?: Json | null;
          timestamp?: string;
        };
      };
      datasets: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          schema: Json;
          record_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          schema?: Json;
          record_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          schema?: Json;
          record_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      dataset_records: {
        Row: {
          id: string;
          dataset_id: string;
          workspace_id: string;
          data: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          dataset_id: string;
          workspace_id: string;
          data: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          dataset_id?: string;
          workspace_id?: string;
          data?: Json;
          created_at?: string;
        };
      };
      usage_events: {
        Row: {
          id: string;
          workspace_id: string;
          event_type: string;
          quantity: number;
          idempotency_key: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          event_type: string;
          quantity?: number;
          idempotency_key?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          event_type?: string;
          quantity?: number;
          idempotency_key?: string | null;
          recorded_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          workspace_id: string;
          plan: "free" | "starter" | "pro" | "business" | "enterprise";
          status: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
          current_period_start: string;
          current_period_end: string;
          cancel_at_period_end: boolean;
          payment_provider: string;
          provider_subscription_id: string | null;
          grace_period_ends_at: string | null;
          dunning_step: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          plan?: "free" | "starter" | "pro" | "business" | "enterprise";
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string;
          provider_subscription_id?: string | null;
          grace_period_ends_at?: string | null;
          dunning_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          plan?: "free" | "starter" | "pro" | "business" | "enterprise";
          status?: "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "paused";
          current_period_start?: string;
          current_period_end?: string;
          cancel_at_period_end?: boolean;
          payment_provider?: string;
          provider_subscription_id?: string | null;
          grace_period_ends_at?: string | null;
          dunning_step?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          workspace_id: string;
          subscription_id: string | null;
          amount_paise: number;
          currency: string;
          status: "draft" | "open" | "paid" | "uncollectible" | "void";
          payment_provider: string;
          provider_invoice_id: string | null;
          due_date: string;
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          subscription_id?: string | null;
          amount_paise: number;
          currency?: string;
          status?: "draft" | "open" | "paid" | "uncollectible" | "void";
          payment_provider?: string;
          provider_invoice_id?: string | null;
          due_date?: string;
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          subscription_id?: string | null;
          amount_paise?: number;
          currency?: string;
          status?: "draft" | "open" | "paid" | "uncollectible" | "void";
          payment_provider?: string;
          provider_invoice_id?: string | null;
          due_date?: string;
          paid_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
