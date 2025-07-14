export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          phone: string | null
          location: string | null
          department: string | null
          timezone: string | null
          role: string | null
          skills: string[] | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          phone?: string | null
          location?: string | null
          department?: string | null
          timezone?: string | null
          role?: string | null
          skills?: string[] | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          phone?: string | null
          location?: string | null
          department?: string | null
          timezone?: string | null
          role?: string | null
          skills?: string[] | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chatbot_messages: {
        Row: {
          id: string
          session_id: string
          sender: string
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          sender: string
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          sender?: string
          message?: string
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_messages_session_id_fkey"
            columns: ["session_id"]
            referencedRelation: "chatbot_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      chatbot_metrics: {
        Row: {
          id: string
          hotel_id: string
          metric_name: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          metric_name: string
          metric_value?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_metrics_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }        ]
      }
      chatbot_sessions: {
        Row: {
          id: string
          guest_id: string
          hotel_id: string
          room_id: string | null
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          hotel_id: string
          room_id?: string | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          hotel_id?: string
          room_id?: string | null
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_sessions_guest_id_fkey"
            columns: ["guest_id"]
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_sessions_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_sessions_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]          }
        ]
      }
      documents: {
        Row: {
          id: string
          hotel_id: string
          uploaded_by: string
          title: string
          file_url: string
          file_type: string
          description: string | null
          metadata: Json | null
          vector_id: string | null
          processed: boolean
          created_at: string
          updated_at: string
          embedding: number[] | null
        }
        Insert: {
          id?: string
          hotel_id: string
          uploaded_by: string
          title: string
          file_url: string
          file_type: string
          description?: string | null
          metadata?: Json | null
          vector_id?: string | null
          embedding?: number[] | null
          processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          uploaded_by?: string
          title?: string
          file_url?: string
          file_type?: string
          description?: string | null
          metadata?: Json | null
          vector_id?: string | null
          embedding?: number[] | null
          processed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "hotel_admins"
            referencedColumns: ["id"]
          }
        ]
      }
      faqs: {
        Row: {
          id: string
          hotel_id: string
          question: string
          answer: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          question: string
          answer: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          question?: string
          answer?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      guests: {
        Row: {
          id: string
          hotel_id: string
          guest_identifier: string
          email: string | null
          created_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          hotel_id: string
          guest_identifier: string
          email?: string | null
          created_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          hotel_id?: string
          guest_identifier?: string
          email?: string | null
          created_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      hotel_admins: {
        Row: {
          id: string
          created_at: string
          hotel_id: string
          user_id: string
          role: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          hotel_id: string
          user_id: string
          role: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          hotel_id?: string
          user_id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_id"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotel_admins_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      hotels: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          address: string
          city: string
          region: string | null
          postal_code: string | null
          country: string
          description: string
          website: string | null
          phone: string | null
          email: string
          is_active: boolean
          timezone: string
          vector_doc_count: number
          trained_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          address: string
          city: string
          region?: string | null
          postal_code?: string | null
          country: string
          description: string
          website?: string | null
          phone?: string | null
          email: string
          is_active?: boolean
          timezone?: string
          vector_doc_count?: number
          trained_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          address?: string
          city?: string
          region?: string | null
          postal_code?: string | null
          country?: string
          description?: string
          website?: string | null
          phone?: string | null
          email?: string
          is_active?: boolean
          timezone?: string
          vector_doc_count?: number
          trained_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      local_events: {
        Row: {
          id: string
          hotel_id: string
          event_name: string
          description: string | null
          location: string | null
          start_date: string
          end_date: string | null
          url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          event_name: string
          description?: string | null
          location?: string | null
          start_date: string
          end_date?: string | null
          url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          event_name?: string
          description?: string | null
          location?: string | null
          start_date?: string
          end_date?: string | null
          url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_events_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }        ]
      }
      rooms: {
        Row: {
          id: string
          hotel_id: string
          room_number: string
          room_type: string
          floor_number: number | null
          capacity: number
          base_price: number
          status: string
          amenities: string[] | null
          description: string | null
          is_active: boolean
          last_cleaned_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          room_number: string
          room_type?: string
          floor_number?: number | null
          capacity?: number
          base_price?: number
          status?: string
          amenities?: string[] | null
          description?: string | null
          is_active?: boolean
          last_cleaned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          room_number?: string
          room_type?: string
          floor_number?: number | null
          capacity?: number
          base_price?: number
          status?: string
          amenities?: string[] | null
          description?: string | null
          is_active?: boolean
          last_cleaned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]          }
        ]
      }
      room_service_items: {
        Row: {
          id: string
          hotel_id: string
          name: string
          description: string | null
          price: number
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hotel_id: string
          name: string
          description?: string | null
          price: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hotel_id?: string
          name?: string
          description?: string | null
          price?: number
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_service_items_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }
      room_service_order_items: {
        Row: {
          id: string
          order_id: string
          item_id: string
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          item_id: string
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "room_service_order_items_item_id_fkey"
            columns: ["item_id"]
            referencedRelation: "room_service_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_service_order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "room_service_orders"
            referencedColumns: ["id"]
          }        ]
      }
      room_service_orders: {
        Row: {
          id: string
          guest_id: string
          hotel_id: string
          status: string
          total_price: number
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guest_id: string
          hotel_id: string
          status?: string
          total_price: number
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guest_id?: string
          hotel_id?: string
          status?: string
          total_price?: number
          source?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_service_orders_guest_id_fkey"
            columns: ["guest_id"]
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_service_orders_hotel_id_fkey"
            columns: ["hotel_id"]
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          }
        ]
      }    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_room_chatbot_metrics: {
        Args: {
          target_hotel_id?: string
        }
        Returns: {
          total_rooms: number
          active_room_chat_sessions: number
          chat_sessions_today: number
          service_requests_from_bot: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
