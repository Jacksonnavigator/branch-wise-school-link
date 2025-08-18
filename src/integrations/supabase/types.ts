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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      academic_results: {
        Row: {
          academic_year: string
          branch_id: string
          created_at: string | null
          grade: string | null
          id: string
          marks: number | null
          remarks: string | null
          student_id: string
          subject_id: string
          teacher_id: string
          term: Database["public"]["Enums"]["term_type"]
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          branch_id: string
          created_at?: string | null
          grade?: string | null
          id?: string
          marks?: number | null
          remarks?: string | null
          student_id: string
          subject_id: string
          teacher_id: string
          term: Database["public"]["Enums"]["term_type"]
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          branch_id?: string
          created_at?: string | null
          grade?: string | null
          id?: string
          marks?: number | null
          remarks?: string | null
          student_id?: string
          subject_id?: string
          teacher_id?: string
          term?: Database["public"]["Enums"]["term_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_results_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academic_results_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          branch_id: string
          created_at: string | null
          date: string
          id: string
          present: boolean
          remarks: string | null
          student_id: string
          teacher_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          date: string
          id?: string
          present?: boolean
          remarks?: string | null
          student_id: string
          teacher_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          date?: string
          id?: string
          present?: boolean
          remarks?: string | null
          student_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_records: {
        Row: {
          behavior_type: Database["public"]["Enums"]["behavior_type"]
          branch_id: string
          created_at: string | null
          date: string
          description: string | null
          id: string
          student_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          behavior_type: Database["public"]["Enums"]["behavior_type"]
          branch_id: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          student_id: string
          teacher_id: string
          title: string
        }
        Update: {
          behavior_type?: Database["public"]["Enums"]["behavior_type"]
          branch_id?: string
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          student_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavior_records_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          academic_year: string
          branch_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          branch_id: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          branch_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_payments: {
        Row: {
          amount_paid: number
          branch_id: string
          created_at: string | null
          fee_structure_id: string
          id: string
          payment_date: string
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string
          remarks: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount_paid: number
          branch_id: string
          created_at?: string | null
          fee_structure_id: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number
          branch_id?: string
          created_at?: string | null
          fee_structure_id?: string
          id?: string
          payment_date?: string
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string
          remarks?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structure"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structure: {
        Row: {
          academic_year: string
          branch_id: string
          class_id: string
          created_at: string | null
          exam_fee: number | null
          id: string
          library_fee: number | null
          other_fees: number | null
          sports_fee: number | null
          term: Database["public"]["Enums"]["term_type"]
          total_amount: number | null
          transport_fee: number | null
          tuition_fee: number
        }
        Insert: {
          academic_year: string
          branch_id: string
          class_id: string
          created_at?: string | null
          exam_fee?: number | null
          id?: string
          library_fee?: number | null
          other_fees?: number | null
          sports_fee?: number | null
          term: Database["public"]["Enums"]["term_type"]
          total_amount?: number | null
          transport_fee?: number | null
          tuition_fee?: number
        }
        Update: {
          academic_year?: string
          branch_id?: string
          class_id?: string
          created_at?: string | null
          exam_fee?: number | null
          id?: string
          library_fee?: number | null
          other_fees?: number | null
          sports_fee?: number | null
          term?: Database["public"]["Enums"]["term_type"]
          total_amount?: number | null
          transport_fee?: number | null
          tuition_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          branch_id: string
          created_at: string | null
          date: string
          description: string | null
          doctor_name: string | null
          document_url: string | null
          id: string
          prescribed_medication: string | null
          record_type: string
          recorded_by: string
          student_id: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          date?: string
          description?: string | null
          doctor_name?: string | null
          document_url?: string | null
          id?: string
          prescribed_medication?: string | null
          record_type: string
          recorded_by: string
          student_id: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          date?: string
          description?: string | null
          doctor_name?: string | null
          document_url?: string | null
          id?: string
          prescribed_medication?: string | null
          record_type?: string
          recorded_by?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          branch_id: string
          created_at: string | null
          email_sent: boolean | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string
          student_id: string | null
          title: string
          type: string
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id: string
          student_id?: string | null
          title: string
          type: string
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          email_sent?: boolean | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string
          student_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_number: string
          branch_id: string
          class_id: string
          created_at: string | null
          date_of_birth: string
          emergency_contact: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          medical_conditions: string | null
          parent_id: string | null
          profile_photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_number: string
          branch_id: string
          class_id: string
          created_at?: string | null
          date_of_birth: string
          emergency_contact?: string | null
          full_name: string
          gender: Database["public"]["Enums"]["gender_type"]
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          medical_conditions?: string | null
          parent_id?: string | null
          profile_photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_number?: string
          branch_id?: string
          class_id?: string
          created_at?: string | null
          date_of_birth?: string
          emergency_contact?: string | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender_type"]
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          medical_conditions?: string | null
          parent_id?: string | null
          profile_photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          branch_id: string
          code: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          branch_id: string
          code?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          branch_id?: string
          code?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_assignments: {
        Row: {
          academic_year: string
          branch_id: string
          class_id: string
          created_at: string | null
          id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          academic_year: string
          branch_id: string
          class_id: string
          created_at?: string | null
          id?: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          academic_year?: string
          branch_id?: string
          class_id?: string
          created_at?: string | null
          id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      behavior_type: "good" | "warning" | "punishment" | "counselor_note"
      gender_type: "male" | "female" | "other"
      payment_status: "pending" | "partial" | "paid" | "overdue"
      term_type: "first" | "second" | "third"
      user_role: "admin" | "headmaster" | "teacher" | "parent"
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
      behavior_type: ["good", "warning", "punishment", "counselor_note"],
      gender_type: ["male", "female", "other"],
      payment_status: ["pending", "partial", "paid", "overdue"],
      term_type: ["first", "second", "third"],
      user_role: ["admin", "headmaster", "teacher", "parent"],
    },
  },
} as const
