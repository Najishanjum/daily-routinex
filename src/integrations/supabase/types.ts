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
      ai_conversations: {
        Row: {
          context_data: Json | null
          created_at: string
          id: string
          message: string
          response: string
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          created_at?: string
          id?: string
          message: string
          response: string
          user_id: string
        }
        Update: {
          context_data?: Json | null
          created_at?: string
          id?: string
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      ambulances: {
        Row: {
          created_at: string | null
          current_lat: number | null
          current_lng: number | null
          driver_name: string
          driver_phone: string
          equipment_list: string[] | null
          hospital_id: string | null
          id: string
          is_available: boolean | null
          vehicle_number: string
        }
        Insert: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          driver_name: string
          driver_phone: string
          equipment_list?: string[] | null
          hospital_id?: string | null
          id?: string
          is_available?: boolean | null
          vehicle_number: string
        }
        Update: {
          created_at?: string | null
          current_lat?: number | null
          current_lng?: number | null
          driver_name?: string
          driver_phone?: string
          equipment_list?: string[] | null
          hospital_id?: string | null
          id?: string
          is_available?: boolean | null
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulances_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_resolved: boolean | null
          message: string
          name: string
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_resolved?: boolean | null
          message: string
          name: string
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_resolved?: boolean | null
          message?: string
          name?: string
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      daily_progress: {
        Row: {
          created_at: string
          date: string
          id: string
          streak_count: number
          tasks_completed: number
          tasks_total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          streak_count?: number
          tasks_completed?: number
          tasks_total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          streak_count?: number
          tasks_completed?: number
          tasks_total?: number
          user_id?: string
        }
        Relationships: []
      }
      donors: {
        Row: {
          age: number
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at: string | null
          emergency_contact: string | null
          id: string
          is_available: boolean | null
          last_donation_date: string | null
          location_lat: number | null
          location_lng: number | null
          medical_conditions: string | null
          user_id: string | null
          weight: number
        }
        Insert: {
          age: number
          blood_group: Database["public"]["Enums"]["blood_group"]
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_conditions?: string | null
          user_id?: string | null
          weight: number
        }
        Update: {
          age?: number
          blood_group?: Database["public"]["Enums"]["blood_group"]
          created_at?: string | null
          emergency_contact?: string | null
          id?: string
          is_available?: boolean | null
          last_donation_date?: string | null
          location_lat?: number | null
          location_lng?: number | null
          medical_conditions?: string | null
          user_id?: string | null
          weight?: number
        }
        Relationships: []
      }
      emergency_requests: {
        Row: {
          assigned_to: string | null
          blood_group: Database["public"]["Enums"]["blood_group"] | null
          contact_number: string
          created_at: string | null
          description: string
          id: string
          location_address: string
          location_lat: number | null
          location_lng: number | null
          patient_age: number | null
          patient_name: string
          request_type: string
          status: Database["public"]["Enums"]["emergency_status"] | null
          updated_at: string | null
          urgency_level: number | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          contact_number: string
          created_at?: string | null
          description: string
          id?: string
          location_address: string
          location_lat?: number | null
          location_lng?: number | null
          patient_age?: number | null
          patient_name: string
          request_type: string
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
          urgency_level?: number | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group"] | null
          contact_number?: string
          created_at?: string | null
          description?: string
          id?: string
          location_address?: string
          location_lat?: number | null
          location_lng?: number | null
          patient_age?: number | null
          patient_name?: string
          request_type?: string
          status?: Database["public"]["Enums"]["emergency_status"] | null
          updated_at?: string | null
          urgency_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      friend_connections: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          available_beds: number | null
          contact_number: string
          created_at: string | null
          emergency_number: string
          hospital_name: string
          id: string
          is_verified: boolean | null
          location_lat: number | null
          location_lng: number | null
          registration_number: string
          specialties: string[] | null
          total_beds: number | null
          user_id: string | null
        }
        Insert: {
          available_beds?: number | null
          contact_number: string
          created_at?: string | null
          emergency_number: string
          hospital_name: string
          id?: string
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          registration_number: string
          specialties?: string[] | null
          total_beds?: number | null
          user_id?: string | null
        }
        Update: {
          available_beds?: number | null
          contact_number?: string
          created_at?: string | null
          emergency_number?: string
          hospital_name?: string
          id?: string
          is_verified?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          registration_number?: string
          specialties?: string[] | null
          total_beds?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_verified: boolean | null
          phone: string
          pincode: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_verified?: boolean | null
          phone: string
          pincode?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          phone?: string
          pincode?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      punishment_rules: {
        Row: {
          action_text: string
          created_at: string
          id: string
          is_active: boolean
          trigger_text: string
          user_id: string
        }
        Insert: {
          action_text: string
          created_at?: string
          id?: string
          is_active?: boolean
          trigger_text: string
          user_id: string
        }
        Update: {
          action_text?: string
          created_at?: string
          id?: string
          is_active?: boolean
          trigger_text?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_goals: {
        Row: {
          created_at: string
          goal_text: string
          id: string
          is_completed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_text: string
          id?: string
          is_completed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          goal_text?: string
          id?: string
          is_completed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_ai_memory: {
        Row: {
          created_at: string
          id: string
          memory_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          memory_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          memory_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      emergency_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "user" | "donor" | "hospital" | "admin"
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
      blood_group: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      emergency_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["user", "donor", "hospital", "admin"],
    },
  },
} as const
