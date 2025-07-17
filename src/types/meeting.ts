export interface MeetingRecording {
  id: string;
  user_id: string;
  title: string;
  audio_url?: string;
  audio_blob?: Blob;
  duration: number; // in seconds
  created_at: string;
  updated_at?: string;
}

export interface MeetingTranscript {
  id: string;
  meeting_id: string;
  content: string;
  created_at: string;
}

export interface MeetingSummary {
  id: string;
  user_id: string;
  meeting_id?: string;
  title: string;
  summary: string;
  key_points: string[];
  action_items: string[];
  participants?: string[];
  transcript?: string;
  audio_url?: string;
  duration?: number; // in seconds
  language?: string; // Speech recognition language code
  meeting_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface MeetingAnalytics {
  duration: number;
  word_count: number;
  key_topics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  action_items_count: number;
}

export interface CreateMeetingSummaryRequest {
  title: string;
  summary: string;
  key_points: string[];
  action_items: string[];
  participants?: string[];
  audio_file?: File;
}

export interface UpdateMeetingSummaryRequest {
  title?: string;
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  participants?: string[];
}
