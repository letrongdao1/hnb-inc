export interface PostInfo {
  id: string;
  user: {
    id: string;
    display_name?: string;
    avatar?: string;
  } | null;
  title: string;
  slug: string;
  description?: string;
  content: string;
  image?: string;
  is_hot?: boolean;
  status: number;
  active_at: string;
  created_at: string;
}
