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
      coin_transactions: {
        Row: {
          coin_change: number;
          created_at: string | null;
          description: string | null;
          id: string;
          related_goal_id: string | null;
          reward_details: Json | null;
          type: string;
          user_id: string;
        };
        Insert: {
          coin_change: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          related_goal_id?: string | null;
          reward_details?: Json | null;
          type: string;
          user_id: string;
        };
        Update: {
          coin_change?: number;
          created_at?: string | null;
          description?: string | null;
          id?: string;
          related_goal_id?: string | null;
          reward_details?: Json | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "coin_transactions_related_goal_id_fkey";
            columns: ["related_goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coin_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_progress: {
        Row: {
          created_at: string | null;
          date: string;
          effective_target_value?: number | null;
          effective_target_unit?: string | null;
          goal_id: string;
          id: string;
          last_fetched_from_healthkit: string | null;
          progress_data: Json | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          effective_target_value?: number | null;
          effective_target_unit?: string | null;
          goal_id: string;
          id?: string;
          last_fetched_from_healthkit?: string | null;
          progress_data?: Json | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          effective_target_value?: number | null;
          effective_target_unit?: string | null;
          goal_id?: string;
          id?: string;
          last_fetched_from_healthkit?: string | null;
          progress_data?: Json | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_progress_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      friends: {
        Row: {
          created_at: string | null;
          requested_by: string;
          status: string;
          updated_at: string | null;
          user_id_1: string;
          user_id_2: string;
        };
        Insert: {
          created_at?: string | null;
          requested_by: string;
          status: string;
          updated_at?: string | null;
          user_id_1: string;
          user_id_2: string;
        };
        Update: {
          created_at?: string | null;
          requested_by?: string;
          status?: string;
          updated_at?: string | null;
          user_id_1?: string;
          user_id_2?: string;
        };
        Relationships: [
          {
            foreignKeyName: "friends_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_user_id_1_fkey";
            columns: ["user_id_1"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friends_user_id_2_fkey";
            columns: ["user_id_2"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      goals: {
        Row: {
          apps_to_block: Json | null;
          created_at: string | null;
          goal_type: string | null;
          id: string;
          is_active: boolean | null;
          target_unit: string | null;
          target_value: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          apps_to_block?: Json | null;
          created_at?: string | null;
          goal_type?: string | null;
          id?: string;
          is_active?: boolean | null;
          target_unit?: string | null;
          target_value?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          apps_to_block?: Json | null;
          created_at?: string | null;
          goal_type?: string | null;
          id?: string;
          is_active?: boolean | null;
          target_unit?: string | null;
          target_value?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      streak_savers_applied: {
        Row: {
          id: string;
          user_id: string;
          date_saved: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date_saved: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          date_saved?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "streak_savers_applied_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_profile_and_stats: {
        Row: {
          coin_balance: number | null;
          current_streak_length: number | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          coin_balance?: number | null;
          current_streak_length?: number | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          coin_balance?: number | null;
          current_streak_length?: number | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profile_and_stats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          created_at: string | null;
          email: string | null;
          id: string;
          username: string | null;
        };
        Insert: {
          created_at?: string | null;
          email?: string | null;
          id: string;
          username?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string | null;
          id?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      user_owned_rewards: {
        Row: {
          id: string;
          user_id: string;
          reward_type: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          reward_type: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          reward_type?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_owned_rewards_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_coin_transaction: {
        Args: {
          p_user_id: string;
          p_coin_change: number;
          p_transaction_type: string;
          p_description: string;
          p_related_goal_id?: string;
        };
        Returns: number;
      };
      handle_goal_completion_streaks_and_bonus: {
        Args:
          | {
              user_id_input: string;
              goal_date_input: string;
              goal_id_input: string;
              bonus_threshold: number;
              bonus_coins: number;
            }
          | { user_id_input: string; progress_date: string };
        Returns: number;
      };
      increment_coin_balance: {
        Args: {
          user_id_input: string;
          amount_input: number;
          transaction_type_input: string;
          transaction_description_input: string;
          goal_id_input: string;
        };
        Returns: undefined;
      };
      purchase_reward: {
        Args:
          | { user_id_input: string; reward_type_input: string }
          | {
              user_id_input: string;
              reward_type_input: string;
              coin_cost_input: number;
              reward_description_input: string;
              reward_details_input?: Json;
            };
        Returns: string;
      };
      set_active_goal: {
        Args: {
          p_user_id: string;
          p_goal_type: string;
          p_target_value: number;
          p_target_unit: string;
          p_apps_to_block: Json;
        };
        Returns: {
          id: string;
          user_id: string;
          goal_type: string;
          target_value: number;
          target_unit: string;
          apps_to_block: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
