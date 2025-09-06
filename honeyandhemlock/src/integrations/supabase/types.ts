export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string
          id: string
          judge_id: string | null
          metadata: Json | null
          script_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          judge_id?: string | null
          metadata?: Json | null
          script_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          judge_id?: string | null
          metadata?: Json | null
          script_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_log_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      judge_applications: {
        Row: {
          availability: string | null
          bio: string | null
          created_at: string | null
          email: string
          experience_years: number | null
          id: string
          name: string
          specialization: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          experience_years?: number | null
          id?: string
          name: string
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          experience_years?: number | null
          id?: string
          name?: string
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      judges: {
        Row: {
          availability: string | null
          average_turnaround_days: number | null
          created_at: string | null
          current_workload: number | null
          email: string
          id: string
          is_admin: boolean | null
          name: string
          password_hash: string
          specialization: string | null
          status: Database["public"]["Enums"]["judge_status"] | null
          total_scripts_reviewed: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          average_turnaround_days?: number | null
          created_at?: string | null
          current_workload?: number | null
          email: string
          id?: string
          is_admin?: boolean | null
          name: string
          password_hash: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["judge_status"] | null
          total_scripts_reviewed?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          average_turnaround_days?: number | null
          created_at?: string | null
          current_workload?: number | null
          email?: string
          id?: string
          is_admin?: boolean | null
          name?: string
          password_hash?: string
          specialization?: string | null
          status?: Database["public"]["Enums"]["judge_status"] | null
          total_scripts_reviewed?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      script_reviews: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          judge_id: string | null
          recommendation: Database["public"]["Enums"]["script_status"] | null
          script_id: string | null
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          judge_id?: string | null
          recommendation?: Database["public"]["Enums"]["script_status"] | null
          script_id?: string | null
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          judge_id?: string | null
          recommendation?: Database["public"]["Enums"]["script_status"] | null
          script_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "script_reviews_judge_id_fkey"
            columns: ["judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "script_reviews_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          amount: number | null
          assigned_judge_id: string | null
          author_email: string
          author_name: string
          author_phone: string | null
          created_at: string | null
          file_name: string | null
          file_url: string | null
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["script_status"] | null
          stripe_payment_intent_id: string | null
          submitted_at: string | null
          tier_description: string | null
          tier_id: string | null
          tier_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          assigned_judge_id?: string | null
          author_email: string
          author_name: string
          author_phone?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["script_status"] | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          tier_description?: string | null
          tier_id?: string | null
          tier_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          assigned_judge_id?: string | null
          author_email?: string
          author_name?: string
          author_phone?: string | null
          created_at?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["script_status"] | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string | null
          tier_description?: string | null
          tier_id?: string | null
          tier_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_assigned_judge_id_fkey"
            columns: ["assigned_judge_id"]
            isOneToOne: false
            referencedRelation: "judges"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sponsorship_payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          sponsor_email: string | null
          sponsor_name: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_admin: {
        Args: { admin_email: string; admin_password: string }
        Returns: {
          id: string
          email: string
          name: string
          is_admin: boolean
        }[]
      }
      log_activity: {
        Args: {
          p_activity_type: string
          p_description: string
          p_user_id?: string
          p_script_id?: string
          p_judge_id?: string
          p_metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      judge_status: "pending" | "approved" | "declined"
      payment_status: "pending" | "paid" | "failed"
      script_status: "pending" | "assigned" | "approved" | "declined"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      judge_status: ["pending", "approved", "declined"],
      payment_status: ["pending", "paid", "failed"],
      script_status: ["pending", "assigned", "approved", "declined"],
    },
  },
} as const
