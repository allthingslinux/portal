export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          is_personal_account: boolean;
          name: string;
          picture_url: string | null;
          primary_owner_user_id: string;
          public_data: Json;
          slug: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          is_personal_account?: boolean;
          name: string;
          picture_url?: string | null;
          primary_owner_user_id?: string;
          public_data?: Json;
          slug?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          id?: string;
          is_personal_account?: boolean;
          name?: string;
          picture_url?: string | null;
          primary_owner_user_id?: string;
          public_data?: Json;
          slug?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      accounts_memberships: {
        Row: {
          account_id: string;
          account_role: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
          user_id: string;
        };
        Insert: {
          account_id: string;
          account_role: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id: string;
        };
        Update: {
          account_id?: string;
          account_role?: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accounts_memberships_account_role_fkey';
            columns: ['account_role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      config: {
        Row: {
          enable_team_accounts: boolean;
        };
        Insert: {
          enable_team_accounts?: boolean;
        };
        Update: {
          enable_team_accounts?: boolean;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        Insert: {
          account_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at?: string;
        };
        Update: {
          account_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: number;
          invite_token?: string;
          invited_by?: string;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invitations_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      nonces: {
        Row: {
          client_token: string;
          created_at: string;
          expires_at: string;
          id: string;
          last_verification_at: string | null;
          last_verification_ip: unknown;
          last_verification_user_agent: string | null;
          metadata: Json | null;
          nonce: string;
          purpose: string;
          revoked: boolean;
          revoked_reason: string | null;
          scopes: string[] | null;
          used_at: string | null;
          user_id: string | null;
          verification_attempts: number;
        };
        Insert: {
          client_token: string;
          created_at?: string;
          expires_at: string;
          id?: string;
          last_verification_at?: string | null;
          last_verification_ip?: unknown;
          last_verification_user_agent?: string | null;
          metadata?: Json | null;
          nonce: string;
          purpose: string;
          revoked?: boolean;
          revoked_reason?: string | null;
          scopes?: string[] | null;
          used_at?: string | null;
          user_id?: string | null;
          verification_attempts?: number;
        };
        Update: {
          client_token?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          last_verification_at?: string | null;
          last_verification_ip?: unknown;
          last_verification_user_agent?: string | null;
          metadata?: Json | null;
          nonce?: string;
          purpose?: string;
          revoked?: boolean;
          revoked_reason?: string | null;
          scopes?: string[] | null;
          used_at?: string | null;
          user_id?: string | null;
          verification_attempts?: number;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          account_id: string;
          body: string;
          channel: Database['public']['Enums']['notification_channel'];
          created_at: string;
          dismissed: boolean;
          expires_at: string | null;
          id: number;
          link: string | null;
          type: Database['public']['Enums']['notification_type'];
        };
        Insert: {
          account_id: string;
          body: string;
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database['public']['Enums']['notification_type'];
        };
        Update: {
          account_id?: string;
          body?: string;
          channel?: Database['public']['Enums']['notification_channel'];
          created_at?: string;
          dismissed?: boolean;
          expires_at?: string | null;
          id?: never;
          link?: string | null;
          type?: Database['public']['Enums']['notification_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_account_workspace';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'user_accounts';
            referencedColumns: ['id'];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database['public']['Enums']['app_permissions'];
          role: string;
        };
        Insert: {
          id?: number;
          permission: Database['public']['Enums']['app_permissions'];
          role: string;
        };
        Update: {
          id?: number;
          permission?: Database['public']['Enums']['app_permissions'];
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'role_permissions_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
      roles: {
        Row: {
          hierarchy_level: number;
          name: string;
        };
        Insert: {
          hierarchy_level: number;
          name: string;
        };
        Update: {
          hierarchy_level?: number;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_account_workspace: {
        Row: {
          id: string | null;
          name: string | null;
          picture_url: string | null;
        };
        Relationships: [];
      };
      user_accounts: {
        Row: {
          id: string | null;
          name: string | null;
          picture_url: string | null;
          role: string | null;
          slug: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_memberships_account_role_fkey';
            columns: ['role'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['name'];
          },
        ];
      };
    };
    Functions: {
      accept_invitation: {
        Args: { token: string; user_id: string };
        Returns: string;
      };
      add_invitations_to_account: {
        Args: {
          account_slug: string;
          invitations: Database['public']['CompositeTypes']['invitation'][];
        };
        Returns: Database['public']['Tables']['invitations']['Row'][];
      };
      can_action_account_member: {
        Args: { target_team_account_id: string; target_user_id: string };
        Returns: boolean;
      };
      cleanup_expired_nonces: {
        Args: {
          p_include_revoked?: boolean;
          p_include_used?: boolean;
          p_older_than_days?: number;
        };
        Returns: number;
      };
      create_invitation: {
        Args: { account_id: string; email: string; role: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invite_token: string;
          invited_by: string;
          role: string;
          updated_at: string;
        };
        SetofOptions: {
          from: '*';
          to: 'invitations';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_nonce: {
        Args: {
          p_expires_in_seconds?: number;
          p_metadata?: Json;
          p_purpose?: string;
          p_revoke_previous?: boolean;
          p_scopes?: string[];
          p_user_id?: string;
        };
        Returns: Json;
      };
      create_team_account: {
        Args: { account_name: string };
        Returns: {
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          id: string;
          is_personal_account: boolean;
          name: string;
          picture_url: string | null;
          primary_owner_user_id: string;
          public_data: Json;
          slug: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'accounts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      get_account_invitations: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: number;
          invited_by: string;
          inviter_email: string;
          inviter_name: string;
          role: string;
          updated_at: string;
        }[];
      };
      get_account_members: {
        Args: { account_slug: string };
        Returns: {
          account_id: string;
          created_at: string;
          email: string;
          id: string;
          name: string;
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          updated_at: string;
          user_id: string;
        }[];
      };
      get_config: { Args: never; Returns: Json };
      get_nonce_status: { Args: { p_id: string }; Returns: Json };
      get_storage_filename_as_uuid: { Args: { name: string }; Returns: string };
      get_upper_system_role: { Args: never; Returns: string };
      has_more_elevated_role: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      has_permission: {
        Args: {
          account_id: string;
          permission_name: Database['public']['Enums']['app_permissions'];
          user_id: string;
        };
        Returns: boolean;
      };
      has_role_on_account: {
        Args: { account_id: string; account_role?: string };
        Returns: boolean;
      };
      has_same_role_hierarchy_level: {
        Args: {
          role_name: string;
          target_account_id: string;
          target_user_id: string;
        };
        Returns: boolean;
      };
      is_aal2: { Args: never; Returns: boolean };
      is_account_owner: { Args: { account_id: string }; Returns: boolean };
      is_account_team_member: {
        Args: { target_account_id: string };
        Returns: boolean;
      };
      is_mfa_compliant: { Args: never; Returns: boolean };
      is_set: { Args: { field_name: string }; Returns: boolean };
      is_super_admin: { Args: never; Returns: boolean };
      is_team_member: {
        Args: { account_id: string; user_id: string };
        Returns: boolean;
      };
      revoke_nonce: {
        Args: { p_id: string; p_reason?: string };
        Returns: boolean;
      };
      slugify: { Args: { value: string }; Returns: string };
      team_account_workspace: {
        Args: { account_slug: string };
        Returns: {
          id: string;
          name: string;
          permissions: Database['public']['Enums']['app_permissions'][];
          picture_url: string;
          primary_owner_user_id: string;
          role: string;
          role_hierarchy_level: number;
          slug: string;
        }[];
      };
      transfer_team_account_ownership: {
        Args: { new_owner_id: string; target_account_id: string };
        Returns: undefined;
      };
      unaccent: { Args: { '': string }; Returns: string };
      verify_nonce: {
        Args: {
          p_ip?: unknown;
          p_max_verification_attempts?: number;
          p_purpose: string;
          p_required_scopes?: string[];
          p_token: string;
          p_user_agent?: string;
          p_user_id?: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      app_permissions:
        | 'roles.manage'
        | 'settings.manage'
        | 'members.manage'
        | 'invites.manage';
      notification_channel: 'in_app' | 'email';
      notification_type: 'info' | 'warning' | 'error';
    };
    CompositeTypes: {
      invitation: {
        email: string | null;
        role: string | null;
      };
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      iceberg_namespaces: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_namespaces_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
        ];
      };
      iceberg_tables: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id?: string;
          location: string;
          name: string;
          namespace_id: string;
          updated_at?: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          location?: string;
          name?: string;
          namespace_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'iceberg_tables_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets_analytics';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'iceberg_tables_namespace_id_fkey';
            columns: ['namespace_id'];
            isOneToOne: false;
            referencedRelation: 'iceberg_namespaces';
            referencedColumns: ['id'];
          },
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prefixes_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: { Args: { name: string }; Returns: string };
      filename: { Args: { name: string }; Returns: string };
      foldername: { Args: { name: string }; Returns: string[] };
      get_level: { Args: { name: string }; Returns: number };
      get_prefix: { Args: { name: string }; Returns: string };
      get_prefixes: { Args: { name: string }; Returns: string[] };
      get_size_by_bucket: {
        Args: never;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: { Args: never; Returns: string };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_permissions: [
        'roles.manage',
        'settings.manage',
        'members.manage',
        'invites.manage',
      ],
      notification_channel: ['in_app', 'email'],
      notification_type: ['info', 'warning', 'error'],
    },
  },
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS'],
    },
  },
} as const;
