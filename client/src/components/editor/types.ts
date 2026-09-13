export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'quote'
  | 'image'
  | 'code'
  | 'video'
  | 'embed'
  | 'divider'
  | 'list'
  | 'callout'
  | 'section';

export interface Block {
  id: string;
  type: BlockType;
  content?: string;
  level?: 1 | 2 | 3;
  url?: string;
  caption?: string;
  width?: 'normal' | 'wide' | 'full';
  language?: string;
  listType?: 'bullet' | 'numbered';
  items?: string[];
  variant?: 'note' | 'tip' | 'warning' | 'info';
  author?: string;
  provider?: string;
  photographerName?: string;
  photographerUrl?: string;
  unsplashUrl?: string;
  sectionNumber?: string;
  sectionTitle?: string;
}

export interface ArticleData {
  id?: string;
  title: string;
  excerpt: string;
  categoryId: string;
  coverImage?: string | null;
  blocks: Block[];
  published?: boolean;
}

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;
}
