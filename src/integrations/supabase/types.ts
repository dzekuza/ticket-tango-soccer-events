export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      individual_tickets: {
        Row: {
          created_at: string
          id: string
          is_used: boolean
          qr_code: string
          qr_code_image: string | null
          seat_number: string | null
          seat_row: string | null
          seat_section: string | null
          ticket_batch_id: string
          tier_id: string | null
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_used?: boolean
          qr_code: string
          qr_code_image?: string | null
          seat_number?: string | null
          seat_row?: string | null
          seat_section?: string | null
          ticket_batch_id: string
          tier_id?: string | null
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_used?: boolean
          qr_code?: string
          qr_code_image?: string | null
          seat_number?: string | null
          seat_row?: string | null
          seat_section?: string | null
          ticket_batch_id?: string
          tier_id?: string | null
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individual_tickets_ticket_batch_id_fkey"
            columns: ["ticket_batch_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_tickets_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "ticket_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_tiers: {
        Row: {
          created_at: string
          id: string
          ticket_batch_id: string
          tier_description: string | null
          tier_name: string
          tier_price: number
          tier_quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          ticket_batch_id: string
          tier_description?: string | null
          tier_name: string
          tier_price?: number
          tier_quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          ticket_batch_id?: string
          tier_description?: string | null
          tier_name?: string
          tier_price?: number
          tier_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_tiers_ticket_batch_id_fkey"
            columns: ["ticket_batch_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          away_team: string | null
          competition: string | null
          created_at: string
          description: string | null
          event_date: string | null
          event_end_time: string | null
          event_start_time: string | null
          event_title: string
          home_team: string | null
          id: string
          pdf_url: string | null
          price: number
          quantity: number
          stadium_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          away_team?: string | null
          competition?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_time?: string | null
          event_start_time?: string | null
          event_title: string
          home_team?: string | null
          id?: string
          pdf_url?: string | null
          price?: number
          quantity?: number
          stadium_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          away_team?: string | null
          competition?: string | null
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_end_time?: string | null
          event_start_time?: string | null
          event_title?: string
          home_team?: string | null
          id?: string
          pdf_url?: string | null
          price?: number
          quantity?: number
          stadium_name?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
