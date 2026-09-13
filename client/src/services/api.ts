import type { User, Post, Category, Comment, Subcategory, FeedResponse } from '../types/index.js';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  };

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export interface OnboardingCategory {
  id?: string;
  name: string;
  borderColor: string;
  activeBorderColor: string;
  topics: {
    id?: string;
    name: string;
    slug?: string;
    storyCount?: string;
  }[];
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  authorName: string;
  authorBio: string;
  avatarUrl: string;
}

export const api = {
  auth: {
    me: () => request<{ user: User | null }>('/auth/me'),
    googleUrl: '/api/auth/google',
    devLogin: (body?: { name?: string; email?: string }) =>
      request<{ message: string; user: User }>('/auth/dev-login', {
        method: 'POST',
        body: JSON.stringify(body || {}),
      }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  },

  onboarding: {
    getCategories: () =>
      request<{
        categories: OnboardingCategory[];
        minRequired: number;
        title: string;
        subtitle: string;
      }>('/onboarding/categories'),
  },

  settings: {
    get: () => request<{ settings: SiteSettings }>('/settings'),
  },

  stories: {
    getFeed: () => request<FeedResponse>('/stories/feed'),
  },

  subcategories: {
    list: (category?: string) => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : '';
      return request<{ subcategories: Subcategory[]; categories: any[] }>(`/subcategories${qs}`);
    },
  },

  posts: {
    list: (params?: { category?: string; topic?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.topic) query.append('topic', params.topic);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString();
      return request<{
        posts: Post[];
        stories?: Post[];
        moreToExplore?: Post[];
        personalized?: boolean;
        userInterests?: string[];
      }>(`/posts${qs ? `?${qs}` : ''}`);
    },
    getFeed: () => request<FeedResponse>('/posts/feed'),
    getBySlug: (slug: string) =>
      request<{ post: Post }>(`/posts/${encodeURIComponent(slug)}`),
    getDraft: (id: string) =>
      request<{ post: Post }>(`/posts/draft/${encodeURIComponent(id)}`),
    myStories: (status?: string) => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : '';
      return request<{ posts: Post[] }>(`/posts/my-stories${qs}`);
    },
    create: (body: {
      title: string;
      excerpt?: string;
      content: string;
      categoryId?: string;
      subcategoryIds?: string[];
      tagNames?: string[];
      published?: boolean;
      coverImage?: string;
    }) =>
      request<{ post: Post }>('/posts', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (
      id: string,
      body: {
        title?: string;
        excerpt?: string;
        content?: string;
        categoryId?: string;
        subcategoryIds?: string[];
        tagNames?: string[];
        published?: boolean;
        coverImage?: string | null;
      }
    ) =>
      request<{ post: Post }>(`/posts/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    clap: (id: string, count = 1) =>
      request<{ claps: number }>(`/posts/${id}/clap`, {
        method: 'POST',
        body: JSON.stringify({ count }),
      }),
    save: (id: string) =>
      request<{ saved: boolean }>(`/posts/${id}/save`, {
        method: 'POST',
      }),
    getComments: (id: string) =>
      request<{ comments: Comment[] }>(`/posts/${id}/comments`),
    postComment: (id: string, content: string) =>
      request<{ comment: Comment }>(`/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  library: {
    getSaved: () => request<{ savedStories: Post[] }>('/library'),
  },

  users: {
    getInterests: () => request<{ interests: Subcategory[] }>('/users/interests'),
    updateInterests: (subcategories: string[]) =>
      request<{ user: User; interests: Subcategory[]; message: string }>('/users/interests', {
        method: 'PUT',
        body: JSON.stringify({ subcategories }),
      }),
    updateTopics: (topics: string[]) =>
      request<{ user: User; message: string }>('/users/topics', {
        method: 'PUT',
        body: JSON.stringify({ topics }),
      }),
    getProfile: () => request<{ profile: User & { interests?: Array<{ subcategory: Subcategory }> } }>('/users/profile'),
  },

  categories: {
    list: () => request<{ categories: Category[] }>('/categories'),
  },

  unsplash: {
    search: (query = 'editorial', page = 1, perPage = 12) =>
      request<{
        results: Array<{
          id: string;
          url: string;
          thumb: string;
          alt: string;
          photographerName: string;
          photographerUrl: string;
          unsplashUrl: string;
        }>;
        total: number;
        totalPages: number;
        isFallback?: boolean;
        message?: string;
      }>(`/unsplash/search?query=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`),
  },
};
