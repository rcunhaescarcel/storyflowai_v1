export interface SceneData {
  id: string;
  image_url: string;
  imagePreview?: string;
  image_prompt?: string;
  audio_data_url?: string;
  narration_text?: string;
  duration?: number;
}

export interface VideoProject {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  input_type: string;
  input_content: string;
  scenes: SceneData[] | null;
  video_duration: number | null;
  status: string;
  final_video_url: string | null;
  created_at: string;
  updated_at: string;
  style?: string;
  thumbnail_url?: string | null;
  scene_count?: number | null;
  is_featured?: boolean;
  format: 'landscape' | 'portrait';
}