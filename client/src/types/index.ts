export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  bio?: string | null;
  topics: string[];
  savedCount?: number;
  storiesCount?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  _count?: { posts: number };
}

export interface Author {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  role?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  illustration: string;
  readingTime: number;
  featured: boolean;
  published: boolean;
  views: number;
  likes: number;
  claps: number;
  reposts: number;
  publishedAt: string | null;
  createdAt: string;
  authorId: string;
  author: Author;
  categoryId: string;
  category: Category;
  subcategories?: Subcategory[];
  matchedSubcategories?: string[];
  matchScore?: number;
  isPersonalized?: boolean;
  tags?: string[] | Array<{ tag: { id: string; name: string; slug: string } }>;
  isSaved?: boolean;
  isReposted?: boolean;
  savedAt?: string;
  _count?: {
    clapsList?: number;
    comments?: number;
    savedBy?: number;
    repostsList?: number;
  };
}

export interface RepostItem {
  repostId: string;
  repostedAt: string;
  repostedBy: string;
  post: Post;
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  userId: string;
  storyCount: number;
  previewCovers: (string | null)[];
  createdAt: string;
  updatedAt: string;
}

export interface ReadingListDetail extends ReadingList {
  author?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  stories: Post[];
}

export interface StoryListStatus {
  listId: string;
  listName: string;
  isPrivate: boolean;
  isInList: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  storyCount?: number;
}

export interface FeedResponse {
  stories: Post[];
  pickOfTheWeek?: Post[];
  pickedForYou?: Post[];
  moreToExplore?: Post[];
  personalized: boolean;
  userInterests: string[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
}

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  categoryColor?: string;
  storyCount?: number;
  followerCount?: number;
  isFollowing?: boolean;
}

export interface TopicCategoryGroup {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string;
  topics: TopicItem[];
}

export interface TopicStoriesResponse {
  topic: TopicItem;
  stories: Post[];
  totalStories: number;
}
