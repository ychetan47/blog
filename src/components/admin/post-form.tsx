"use client";

import React, { useState, useActionState } from "react";
import Link from "next/link";
import { savePostAction } from "@/app/admin/actions";
import { MarkdownView } from "@/components/markdown-view";
import { ArticleIllustration } from "@/components/illustrations";
import {
  Bold,
  Italic,
  Heading,
  Code,
  Quote,
  List,
  Link2,
  Table,
  Eye,
  Edit3,
  Sparkles,
  ArrowLeft,
  Save,
  CheckCircle,
} from "lucide-react";
import { slugify } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categoryId: string;
    illustration: string;
    coverImage: string | null;
    featured: boolean;
    published: boolean;
    tags: { tag: { name: string } }[];
  };
  categories: Category[];
}

export function PostForm({ post, categories }: PostFormProps) {
  const [state, formAction, isPending] = useActionState(savePostAction, null);

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(
    post?.content ||
      `### Introduction\n\nStart writing your article in Markdown here...\n\n\`\`\`java\n@Service\npublic class ExampleService {\n    // your code\n}\n\`\`\`\n`
  );
  const [selectedIllustration, setSelectedIllustration] = useState(
    post?.illustration || "astronaut"
  );
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [published, setPublished] = useState(post ? post.published : true);
  const [featured, setFeatured] = useState(post ? post.featured : false);
  const [tags, setTags] = useState(
    post?.tags?.map((t) => t.tag.name).join(", ") || ""
  );
  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">(
    "write"
  );

  // Auto-generate slug when title changes (if new post or slug is empty)
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!post) {
      setSlug(slugify(newTitle));
    }
  };

  // Helper to insert markdown tokens at cursor
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || "text"}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4)
      );
    }, 50);
  };

  const illustrationPresets = [
    { id: "astronaut", label: "Astronaut (Design/Career)" },
    { id: "rocket", label: "Rocket (Launch/Growth)" },
    { id: "desk", label: "Tired Coder (Productivity)" },
    { id: "server", label: "Server Rack (Backend/Kafka)" },
    { id: "terminal", label: "Terminal (System Design)" },
    { id: "coffee", label: "Coffee (Architecture/Java)" },
  ];

  return (
    <form action={formAction} className="space-y-8">
      {post?.id && <input type="hidden" name="id" value={post.id} />}

      {/* Header and Action buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {post ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-xs text-slate-500">
              {post ? `Editing: ${post.title}` : "Draft a technical or personal blog post"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts"
            className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? "Saving..." : post ? "Update Article" : "Publish Article"}</span>
          </button>
        </div>
      </div>

      {state?.error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
          {state.error}
        </div>
      )}

      {/* Two-Column Editor Layout: Left Editor, Right Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Article Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Building Reliable Kafka Consumers in Production"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                URL Slug <span className="text-slate-400 font-normal">(auto-generated)</span>
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-xs text-slate-400 font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="article-slug"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-mono focus:bg-white focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Short Excerpt
              </label>
              <textarea
                name="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A compelling 1-2 sentence preview for search results and social cards..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Markdown Content & Toolbar */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Toolbar & View Toggle */}
            <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => insertFormatting("**", "**")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("*", "*")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("### ")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Heading 3"
                >
                  <Heading className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("> ")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Quote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("- ")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("```java\n", "\n```")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Java Code Block"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting("[link text](", ")")}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-700 transition-colors"
                  title="Link"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "write"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "preview"
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Editor Area */}
            {activeTab === "write" ? (
              <textarea
                id="content-editor"
                name="content"
                required
                rows={20}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-6 text-sm font-mono leading-relaxed bg-white border-none outline-none focus:ring-0 resize-y selection:bg-blue-100"
                placeholder="Write your article in Markdown..."
              />
            ) : (
              <div className="p-8 min-h-[460px] bg-slate-50/50">
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
                  <MarkdownView content={content} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Metadata (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Controls */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Publishing Options
            </h3>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Publish Immediately</span>
                  <p className="text-[11px] text-slate-400">
                    Uncheck to save as private draft
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Feature on Homepage</span>
                  <p className="text-[11px] text-slate-400">
                    Prominently showcases this article
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Taxonomy
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="categoryId"
                required
                defaultValue={post?.categoryId || categories[0]?.id}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tags <span className="text-slate-400 font-normal">(comma-separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="kafka, spring-boot, java"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>

          {/* Visual Illustration / Cover */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Cover Visual
            </h3>

            {/* Illustration Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Pastel Illustration
              </label>
              <div className="grid grid-cols-3 gap-2">
                {illustrationPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedIllustration(preset.id);
                      setCoverImage("");
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      selectedIllustration === preset.id && !coverImage
                        ? "border-blue-500 bg-blue-50/50 shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-12 h-10 rounded-lg overflow-hidden">
                      <ArticleIllustration type={preset.id} className="w-full h-full" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 capitalize">
                      {preset.id}
                    </span>
                  </button>
                ))}
              </div>
              <input type="hidden" name="illustration" value={selectedIllustration} />
            </div>

            {/* Custom Cover Image URL */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Custom Image URL
              </label>
              <input
                type="url"
                name="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
