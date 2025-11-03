export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_approvals: {
        Row: {
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          agent_id: string
          appointment_date: string
          buyer_id: string
          created_at: string
          id: string
          message: string | null
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          appointment_date: string
          buyer_id: string
          created_at?: string
          id?: string
          message?: string | null
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          appointment_date?: string
          buyer_id?: string
          created_at?: string
          id?: string
          message?: string | null
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      compounds: {
        Row: {
          amenities: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          features: Json | null
          gallery_images: string[] | null
          hero_image_url: string | null
          id: string
          latitude: number | null
          location: string
          logo_url: string | null
          longitude: number | null
          name: string
          property_count: number | null
          slug: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          location: string
          logo_url?: string | null
          longitude?: number | null
          name: string
          property_count?: number | null
          slug: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          features?: Json | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          location?: string
          logo_url?: string | null
          longitude?: number | null
          name?: string
          property_count?: number | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string
          buyer_id: string
          created_at: string
          id: string
          property_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          buyer_id: string
          created_at?: string
          id?: string
          property_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      launches: {
        Row: {
          amenities: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          developer_start_price: number | null
          features: Json | null
          gallery_images: string[] | null
          hero_image_url: string | null
          id: string
          latitude: number | null
          location: string
          logo_url: string | null
          longitude: number | null
          master_plan_url: string | null
          payment_plans: Json | null
          resale_start_price: number | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer_start_price?: number | null
          features?: Json | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          location: string
          logo_url?: string | null
          longitude?: number | null
          master_plan_url?: string | null
          payment_plans?: Json | null
          resale_start_price?: number | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer_start_price?: number | null
          features?: Json | null
          gallery_images?: string[] | null
          hero_image_url?: string | null
          id?: string
          latitude?: number | null
          location?: string
          logo_url?: string | null
          longitude?: number | null
          master_plan_url?: string | null
          payment_plans?: Json | null
          resale_start_price?: number | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: number | null
          created_at: string
          id: string
          location: string
          name: string
          phone: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          id?: string
          location: string
          name: string
          phone: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          agent_id: string
          amenities: string[] | null
          bathrooms: number
          bedrooms: number
          categories: string[] | null
          city: string
          compound_id: string | null
          created_at: string
          description: string
          expires_at: string | null
          featured: boolean
          garage: number | null
          id: string
          images: string[]
          latitude: number | null
          launch_id: string | null
          longitude: number | null
          lot_size: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          square_feet: number
          state: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views: number
          year_built: number | null
          zip_code: string | null
        }
        Insert: {
          address: string
          agent_id: string
          amenities?: string[] | null
          bathrooms: number
          bedrooms: number
          categories?: string[] | null
          city: string
          compound_id?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          featured?: boolean
          garage?: number | null
          id?: string
          images?: string[]
          latitude?: number | null
          launch_id?: string | null
          longitude?: number | null
          lot_size?: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          square_feet: number
          state?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views?: number
          year_built?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string
          agent_id?: string
          amenities?: string[] | null
          bathrooms?: number
          bedrooms?: number
          categories?: string[] | null
          city?: string
          compound_id?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          featured?: boolean
          garage?: number | null
          id?: string
          images?: string[]
          latitude?: number | null
          launch_id?: string | null
          longitude?: number | null
          lot_size?: number | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          square_feet?: number
          state?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views?: number
          year_built?: number | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_compound_id_fkey"
            columns: ["compound_id"]
            isOneToOne: false
            referencedRelation: "compounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_launch_id_fkey"
            columns: ["launch_id"]
            isOneToOne: false
            referencedRelation: "launches"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          filters: Json | null
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          filters?: Json | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_inquiries: {
        Row: {
          compound: string | null
          created_at: string
          id: string
          location: string
          name: string
          phone: string
          property_type: string
        }
        Insert: {
          compound?: string | null
          created_at?: string
          id?: string
          location: string
          name: string
          phone: string
          property_type: string
        }
        Update: {
          compound?: string | null
          created_at?: string
          id?: string
          location?: string
          name?: string
          phone?: string
          property_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_admin_role_by_email: {
        Args: { user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "buyer" | "agent" | "admin"
      listing_status: "pending" | "approved" | "rejected" | "expired"
      property_type:
        | "house"
        | "apartment"
        | "condo"
        | "townhouse"
        | "land"
        | "villa"
        | "studio"
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
      app_role: ["buyer", "agent", "admin"],
      listing_status: ["pending", "approved", "rejected", "expired"],
      property_type: [
        "house",
        "apartment",
        "condo",
        "townhouse",
        "land",
        "villa",
        "studio",
      ],
    },
  },
} as const
