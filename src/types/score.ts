export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Virtuoso';

export interface ScoreRecord {
  id: string;
  title: string;
  composer: string;
  arranger?: string;
  instrumentation?: string;
  musical_key?: string;
  difficulty?: DifficultyLevel;
  genre?: string;
  tags: string[];
  drive_file_id: string;
  original_filename: string;
  view_url: string;
  download_url?: string;
  is_categorized: boolean;
  created_at: string;
  updated_at: string;
}
