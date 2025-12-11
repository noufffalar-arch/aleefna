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
      adoption_requests: {
        Row: {
          adopter_id: string
          created_at: string
          id: string
          message: string | null
          pet_id: string
          shelter_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          adopter_id: string
          created_at?: string
          id?: string
          message?: string | null
          pet_id: string
          shelter_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          adopter_id?: string
          created_at?: string
          id?: string
          message?: string | null
          pet_id?: string
          shelter_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_slots: {
        Row: {
          booked_by: string | null
          clinic_id: string
          created_at: string
          doctor_id: string
          end_time: string
          id: string
          is_booked: boolean | null
          slot_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          booked_by?: string | null
          clinic_id: string
          created_at?: string
          doctor_id: string
          end_time: string
          id?: string
          is_booked?: boolean | null
          slot_date: string
          start_time: string
          updated_at?: string
        }
        Update: {
          booked_by?: string | null
          clinic_id?: string
          created_at?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_booked?: boolean | null
          slot_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_slots_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointment_slots_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          clinic_id: string | null
          created_at: string
          doctor_id: string | null
          doctor_name: string | null
          id: string
          notes: string | null
          pet_id: string | null
          service_price: number | null
          service_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          pet_id?: string | null
          service_price?: number | null
          service_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          clinic_id?: string | null
          created_at?: string
          doctor_id?: string | null
          doctor_name?: string | null
          id?: string
          notes?: string | null
          pet_id?: string | null
          service_price?: number | null
          service_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_support_cases: {
        Row: {
          clinic_id: string | null
          created_at: string
          estimated_cost: number | null
          id: string
          notes: string | null
          pet_id: string
          shelter_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          pet_id: string
          shelter_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          pet_id?: string
          shelter_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_support_cases_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_support_cases_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          area: string | null
          city: string
          created_at: string
          doctor_name: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          photo_url: string | null
          prices: Json | null
          services: string[] | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          city: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          prices?: Json | null
          services?: string[] | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          city?: string
          created_at?: string
          doctor_name?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          prices?: Json | null
          services?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          photo_url: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          photo_url?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_report_sightings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          latitude: number
          location_text: string
          longitude: number
          missing_report_id: string
          photo_url: string | null
          reported_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          location_text: string
          longitude: number
          missing_report_id: string
          photo_url?: string | null
          reported_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          location_text?: string
          longitude?: number
          missing_report_id?: string
          photo_url?: string | null
          reported_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_report_sightings_missing_report_id_fkey"
            columns: ["missing_report_id"]
            isOneToOne: false
            referencedRelation: "missing_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missing_report_sightings_missing_report_id_fkey"
            columns: ["missing_report_id"]
            isOneToOne: false
            referencedRelation: "missing_reports_map"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_reports: {
        Row: {
          contact_phone: string
          created_at: string
          description: string | null
          id: string
          last_seen_date: string
          last_seen_location: string
          latitude: number | null
          longitude: number | null
          pet_id: string
          resolution_notes: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_phone: string
          created_at?: string
          description?: string | null
          id?: string
          last_seen_date: string
          last_seen_location: string
          latitude?: number | null
          longitude?: number | null
          pet_id: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_phone?: string
          created_at?: string
          description?: string | null
          id?: string
          last_seen_date?: string
          last_seen_location?: string
          latitude?: number | null
          longitude?: number | null
          pet_id?: string
          resolution_notes?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "missing_reports_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: string | null
          breed: string | null
          color: string | null
          created_at: string
          description: string | null
          gender: string | null
          health_status: string | null
          id: string
          is_for_adoption: boolean | null
          is_missing: boolean | null
          is_neutered: boolean | null
          is_vaccinated: boolean | null
          medical_notes: string | null
          microchip_id: string | null
          name: string
          photo_url: string | null
          species: string
          updated_at: string
          user_id: string
          vaccinations: string[] | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          is_for_adoption?: boolean | null
          is_missing?: boolean | null
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
          medical_notes?: string | null
          microchip_id?: string | null
          name: string
          photo_url?: string | null
          species: string
          updated_at?: string
          user_id: string
          vaccinations?: string[] | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          gender?: string | null
          health_status?: string | null
          id?: string
          is_for_adoption?: boolean | null
          is_missing?: boolean | null
          is_neutered?: boolean | null
          is_vaccinated?: boolean | null
          medical_notes?: string | null
          microchip_id?: string | null
          name?: string
          photo_url?: string | null
          species?: string
          updated_at?: string
          user_id?: string
          vaccinations?: string[] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stray_reports: {
        Row: {
          animal_type: string
          clinic_name: string | null
          clinic_notes: string | null
          created_at: string
          danger_level: string
          description: string | null
          id: string
          latitude: number | null
          location_text: string
          longitude: number | null
          photo_url: string | null
          rescue_date: string | null
          status: string | null
          taken_to_clinic: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          animal_type: string
          clinic_name?: string | null
          clinic_notes?: string | null
          created_at?: string
          danger_level: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_text: string
          longitude?: number | null
          photo_url?: string | null
          rescue_date?: string | null
          status?: string | null
          taken_to_clinic?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          animal_type?: string
          clinic_name?: string | null
          clinic_notes?: string | null
          created_at?: string
          danger_level?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_text?: string
          longitude?: number | null
          photo_url?: string | null
          rescue_date?: string | null
          status?: string | null
          taken_to_clinic?: boolean | null
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      missing_reports_map: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          last_seen_date: string | null
          last_seen_location: string | null
          latitude: number | null
          longitude: number | null
          pet_id: string | null
          pet_name: string | null
          pet_photo_url: string | null
          pet_species: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_reports_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      stray_reports_map: {
        Row: {
          animal_type: string | null
          created_at: string | null
          danger_level: string | null
          description: string | null
          id: string | null
          latitude: number | null
          location_text: string | null
          longitude: number | null
          photo_url: string | null
          status: string | null
        }
        Insert: {
          animal_type?: string | null
          created_at?: string | null
          danger_level?: string | null
          description?: string | null
          id?: string | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          photo_url?: string | null
          status?: string | null
        }
        Update: {
          animal_type?: string | null
          created_at?: string | null
          danger_level?: string | null
          description?: string | null
          id?: string | null
          latitude?: number | null
          location_text?: string | null
          longitude?: number | null
          photo_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator"
      user_role:
        | "owner"
        | "clinic"
        | "store"
        | "shelter"
        | "government"
        | "admin"
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
      app_role: ["admin", "moderator"],
      user_role: ["owner", "clinic", "store", "shelter", "government", "admin"],
    },
  },
} as const
