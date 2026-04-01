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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      acreditation_documents: {
        Row: {
          created_at: string | null
          criterio_cna: string | null
          dimension: string | null
          document_type: string
          file_path: string | null
          id: string
          processed: boolean | null
          summary: string | null
          title: string
          uploaded_at: string | null
        }
        Insert: {
          created_at?: string | null
          criterio_cna?: string | null
          dimension?: string | null
          document_type?: string
          file_path?: string | null
          id?: string
          processed?: boolean | null
          summary?: string | null
          title: string
          uploaded_at?: string | null
        }
        Update: {
          created_at?: string | null
          criterio_cna?: string | null
          dimension?: string | null
          document_type?: string
          file_path?: string | null
          id?: string
          processed?: boolean | null
          summary?: string | null
          title?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      agent_tasks: {
        Row: {
          agent_id: string
          category: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          category?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
          area: string
          code: string
          color: string
          color_secondary: string | null
          created_at: string | null
          criteria_cna: string[] | null
          dependencies: string[] | null
          description: string | null
          error_rate: number | null
          id: string
          items_processed_24h: number | null
          last_run: string | null
          name: string
          platform: string
          status: string
          trigger_type: string | null
          updated_at: string | null
          workflow_id: string | null
        }
        Insert: {
          area: string
          code: string
          color: string
          color_secondary?: string | null
          created_at?: string | null
          criteria_cna?: string[] | null
          dependencies?: string[] | null
          description?: string | null
          error_rate?: number | null
          id: string
          items_processed_24h?: number | null
          last_run?: string | null
          name: string
          platform: string
          status?: string
          trigger_type?: string | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Update: {
          area?: string
          code?: string
          color?: string
          color_secondary?: string | null
          created_at?: string | null
          criteria_cna?: string[] | null
          dependencies?: string[] | null
          description?: string | null
          error_rate?: number | null
          id?: string
          items_processed_24h?: number | null
          last_run?: string | null
          name?: string
          platform?: string
          status?: string
          trigger_type?: string | null
          updated_at?: string | null
          workflow_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          action_required: string | null
          agent_id: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string
          resolved: boolean | null
          resolved_at: string | null
          title: string
        }
        Insert: {
          action_required?: string | null
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority: string
          resolved?: boolean | null
          resolved_at?: string | null
          title: string
        }
        Update: {
          action_required?: string | null
          agent_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string
          resolved?: boolean | null
          resolved_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      cna_criteria: {
        Row: {
          actions: string[] | null
          created_at: string | null
          current_level: string | null
          dimension: string
          evidence_count: number | null
          gap_description: string | null
          id: string
          is_mandatory: boolean | null
          is_priority: boolean | null
          name: string
          responsible_agent: string | null
          target_level: string | null
          updated_at: string | null
        }
        Insert: {
          actions?: string[] | null
          created_at?: string | null
          current_level?: string | null
          dimension: string
          evidence_count?: number | null
          gap_description?: string | null
          id: string
          is_mandatory?: boolean | null
          is_priority?: boolean | null
          name: string
          responsible_agent?: string | null
          target_level?: string | null
          updated_at?: string | null
        }
        Update: {
          actions?: string[] | null
          created_at?: string | null
          current_level?: string | null
          dimension?: string
          evidence_count?: number | null
          gap_description?: string | null
          id?: string
          is_mandatory?: boolean | null
          is_priority?: boolean | null
          name?: string
          responsible_agent?: string | null
          target_level?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      convenios: {
        Row: {
          archivo_drive_url: string | null
          archivo_nombre: string | null
          beneficio_arancel_pct: number | null
          beneficio_creditos: number | null
          carreras_habilitadas: string[] | null
          contraparte: Database["public"]["Enums"]["convenio_contraparte"]
          created_at: string | null
          criterios_cna: string[] | null
          cupos_anuales: number | null
          descripcion: string | null
          email_contacto: string | null
          estado: Database["public"]["Enums"]["convenio_estado"]
          fecha_inicio: string | null
          fecha_termino: string | null
          id: string
          nombre_institucion: string
          observaciones: string | null
          para_carrera: string | null
          persona_contacto: string | null
          tipo: Database["public"]["Enums"]["convenio_tipo"]
          updated_at: string | null
        }
        Insert: {
          archivo_drive_url?: string | null
          archivo_nombre?: string | null
          beneficio_arancel_pct?: number | null
          beneficio_creditos?: number | null
          carreras_habilitadas?: string[] | null
          contraparte: Database["public"]["Enums"]["convenio_contraparte"]
          created_at?: string | null
          criterios_cna?: string[] | null
          cupos_anuales?: number | null
          descripcion?: string | null
          email_contacto?: string | null
          estado?: Database["public"]["Enums"]["convenio_estado"]
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre_institucion: string
          observaciones?: string | null
          para_carrera?: string | null
          persona_contacto?: string | null
          tipo: Database["public"]["Enums"]["convenio_tipo"]
          updated_at?: string | null
        }
        Update: {
          archivo_drive_url?: string | null
          archivo_nombre?: string | null
          beneficio_arancel_pct?: number | null
          beneficio_creditos?: number | null
          carreras_habilitadas?: string[] | null
          contraparte?: Database["public"]["Enums"]["convenio_contraparte"]
          created_at?: string | null
          criterios_cna?: string[] | null
          cupos_anuales?: number | null
          descripcion?: string | null
          email_contacto?: string | null
          estado?: Database["public"]["Enums"]["convenio_estado"]
          fecha_inicio?: string | null
          fecha_termino?: string | null
          id?: string
          nombre_institucion?: string
          observaciones?: string | null
          para_carrera?: string | null
          persona_contacto?: string | null
          tipo?: Database["public"]["Enums"]["convenio_tipo"]
          updated_at?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          accion_requerida: boolean | null
          accion_resumen: string | null
          agent_id: string | null
          asunto: string | null
          categoria: string | null
          created_at: string | null
          criterios_cna: string[] | null
          de: string | null
          deadline: string | null
          fecha: string
          id: string
          prioridad: string | null
          sub_etiqueta: string | null
        }
        Insert: {
          accion_requerida?: boolean | null
          accion_resumen?: string | null
          agent_id?: string | null
          asunto?: string | null
          categoria?: string | null
          created_at?: string | null
          criterios_cna?: string[] | null
          de?: string | null
          deadline?: string | null
          fecha: string
          id: string
          prioridad?: string | null
          sub_etiqueta?: string | null
        }
        Update: {
          accion_requerida?: boolean | null
          accion_resumen?: string | null
          agent_id?: string | null
          asunto?: string | null
          categoria?: string | null
          created_at?: string | null
          criterios_cna?: string[] | null
          de?: string | null
          deadline?: string | null
          fecha?: string
          id?: string
          prioridad?: string | null
          sub_etiqueta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      executions: {
        Row: {
          agent_id: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          items_processed: number | null
          started_at: string | null
          status: string | null
          workflow_id: string | null
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_processed?: number | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          items_processed?: number | null
          started_at?: string | null
          status?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_records: {
        Row: {
          amount: number
          category: string
          concept: string
          created_at: string | null
          id: string
          notes: string | null
          period: string
          record_type: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          category?: string
          concept: string
          created_at?: string | null
          id?: string
          notes?: string | null
          period: string
          record_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          category?: string
          concept?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          period?: string
          record_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      institutional_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric_key: string
          metric_text: string | null
          metric_value: number | null
          period: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric_key: string
          metric_text?: string | null
          metric_value?: number | null
          period: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metric_key?: string
          metric_text?: string | null
          metric_value?: number | null
          period?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      otec_programs: {
        Row: {
          created_at: string | null
          empresa: string | null
          end_date: string | null
          id: string
          name: string
          revenue: number | null
          sence_code: string | null
          start_date: string | null
          status: string
          students_enrolled: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa?: string | null
          end_date?: string | null
          id?: string
          name: string
          revenue?: number | null
          sence_code?: string | null
          start_date?: string | null
          status?: string
          students_enrolled?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa?: string | null
          end_date?: string | null
          id?: string
          name?: string
          revenue?: number | null
          sence_code?: string | null
          start_date?: string | null
          status?: string
          students_enrolled?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rag_documents: {
        Row: {
          agent_id: string | null
          categoria: string | null
          chunk_count: number | null
          created_at: string | null
          criterios_cna: string[] | null
          fecha: string | null
          fuente: string | null
          id: string
          titulo: string
        }
        Insert: {
          agent_id?: string | null
          categoria?: string | null
          chunk_count?: number | null
          created_at?: string | null
          criterios_cna?: string[] | null
          fecha?: string | null
          fuente?: string | null
          id: string
          titulo: string
        }
        Update: {
          agent_id?: string | null
          categoria?: string | null
          chunk_count?: number | null
          created_at?: string | null
          criterios_cna?: string[] | null
          fecha?: string | null
          fuente?: string | null
          id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "rag_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metric_name: string
          metric_text: string | null
          metric_value: number | null
          recorded_at: string | null
        }
        Insert: {
          id?: string
          metric_name: string
          metric_text?: string | null
          metric_value?: number | null
          recorded_at?: string | null
        }
        Update: {
          id?: string
          metric_name?: string
          metric_text?: string | null
          metric_value?: number | null
          recorded_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "director" | "dg" | "staff"
      convenio_contraparte:
        | "municipalidad"
        | "empresa_privada"
        | "ies_universidad"
        | "ies_cft_ip"
        | "sociedad_civil_ong"
        | "organismo_publico"
        | "fundacion"
        | "internacional"
        | "otro"
      convenio_estado:
        | "activo"
        | "expirado"
        | "pendiente_firma"
        | "en_negociacion"
        | "suspendido"
      convenio_tipo:
        | "practica_profesional"
        | "prosecucion_estudios"
        | "cooperacion_tecnica"
        | "descuento_arancel"
        | "colaboracion_institucional"
        | "otec_empresa"
        | "erasmus"
        | "investigacion"
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
      app_role: ["director", "dg", "staff"],
      convenio_contraparte: [
        "municipalidad",
        "empresa_privada",
        "ies_universidad",
        "ies_cft_ip",
        "sociedad_civil_ong",
        "organismo_publico",
        "fundacion",
        "internacional",
        "otro",
      ],
      convenio_estado: [
        "activo",
        "expirado",
        "pendiente_firma",
        "en_negociacion",
        "suspendido",
      ],
      convenio_tipo: [
        "practica_profesional",
        "prosecucion_estudios",
        "cooperacion_tecnica",
        "descuento_arancel",
        "colaboracion_institucional",
        "otec_empresa",
        "erasmus",
        "investigacion",
      ],
    },
  },
} as const
