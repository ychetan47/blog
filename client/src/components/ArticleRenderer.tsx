import { useState } from 'react';
import { ExternalLink, Copy, Check, Info, Lightbulb, AlertTriangle, Bookmark } from 'lucide-react';
import type { Block } from './editor/types.js';
import { highlightCode } from '../lib/syntaxHighlight.js';
import { MarkdownView } from './MarkdownView.js';

interface ArticleRendererProps {
  content: string | Block[];
}

export function ArticleRenderer({ content }: ArticleRendererProps) {
  let blocks: Block[] | null = null;
  let isLegacyMarkdown = false;

  if (Array.isArray(content)) {
    blocks = content;
  } else if (typeof content === 'string') {
    const trimmed = content.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          blocks = parsed;
        }
      } catch {
        isLegacyMarkdown = true;
      }
    } else {
      isLegacyMarkdown = true;
    }
  }

  if (isLegacyMarkdown || !blocks) {
    return <MarkdownView content={typeof content === 'string' ? content : ''} />;
  }

  return (
    <div className="article-body-render space-y-2">
      {blocks.map((block, idx) => (
        <RenderBlockItem key={block.id || idx} block={block} />
      ))}
    </div>
  );
}

function RenderBlockItem({ block }: { block: Block }) {
  const [copied, setCopied] = useState(false);

  switch (block.type) {
    case 'paragraph': {
      if (!block.content || block.content === '<br>') return null;
      return (
        <p
          className="text-[18px] md:text-[19px] leading-[1.8] text-[#2E2A25] font-normal tracking-[-0.01em] my-5"
          dangerouslySetInnerHTML={{ __html: block.content }}
        />
      );
    }

    case 'heading': {
      const level = block.level || 2;
      if (level === 1) {
        return (
          <h2
            className="font-editorial text-3xl sm:text-4xl text-[#211E1A] font-normal mt-10 mb-4 tracking-[-0.015em] leading-[1.25]"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );
      }
      if (level === 2) {
        return (
          <h3
            className="font-editorial text-2xl sm:text-3xl text-[#211E1A] font-normal mt-8 mb-3 tracking-[-0.015em] leading-[1.3]"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        );
      }
      return (
        <h4
          className="font-editorial text-xl sm:text-2xl text-[#211E1A] font-normal mt-6 mb-2 tracking-[-0.015em] leading-[1.35]"
          dangerouslySetInnerHTML={{ __html: block.content || '' }}
        />
      );
    }

    case 'quote': {
      return (
        <blockquote className="my-8 pl-6 border-l-2 border-[#211E1A] py-1">
          <p
            className="font-editorial italic text-2xl sm:text-3xl text-[#211E1A] leading-[1.4]"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
          {block.author && (
            <cite className="block not-italic text-sm font-sans text-[#716D65] mt-3">
              — {block.author}
            </cite>
          )}
        </blockquote>
      );
    }

    case 'image': {
      if (!block.url) return null;
      const width = block.width || 'normal';
      const widthClass = {
        normal: 'max-w-full mx-auto',
        wide: 'max-w-[850px] -mx-4 sm:-mx-8 lg:-mx-12',
        full: 'w-full -mx-4 sm:-mx-12 lg:-mx-20',
      }[width];

      return (
        <figure className={`my-10 ${widthClass}`}>
          <div className="overflow-hidden rounded-xl bg-[#EFECE6] shadow-sm">
            <img
              src={block.url}
              alt={block.caption || 'Article image'}
              className="w-full h-auto object-cover max-h-[720px]"
              loading="lazy"
            />
          </div>
          {(block.caption || block.photographerName) && (
            <figcaption className="mt-3 text-center">
              {block.caption && (
                <p className="text-xs sm:text-sm italic text-[#716D65]">{block.caption}</p>
              )}
              {block.photographerName && (
                <p className="text-[11px] text-[#716D65]/70 mt-1 flex items-center justify-center gap-1">
                  <span>Photo by</span>
                  {block.photographerUrl ? (
                    <a
                      href={block.photographerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-[#211E1A] transition-colors"
                    >
                      {block.photographerName}
                    </a>
                  ) : (
                    <span>{block.photographerName}</span>
                  )}
                  <span>on</span>
                  <a
                    href={block.unsplashUrl || 'https://unsplash.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-[#211E1A] transition-colors flex items-center gap-0.5"
                  >
                    Unsplash
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </p>
              )}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'code': {
      const lang = block.language || 'javascript';
      const code = block.content || '';
      const highlighted = highlightCode(code, lang);

      const copyCode = async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {}
      };

      return (
        <div className="my-8 rounded-xl overflow-hidden border border-[#38332E] bg-[#1E1D1B] shadow-md">
          <div className="flex items-center justify-between px-4 py-2 bg-[#171614] border-b border-[#2C2925] text-xs font-mono text-[#DDD9D0]">
            <span className="uppercase tracking-wider text-[11px] text-[#9E9B95]">{lang}</span>
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] text-[#9E9B95] hover:text-[#F8F7F3] rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed">
            <pre>
              <code
                className={`language-${lang}`}
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            </pre>
          </div>
        </div>
      );
    }

    case 'video': {
      if (!block.url) return null;
      let embedSrc = block.url;
      let isIframe = false;

      const ytMatch = block.url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
      if (ytMatch && ytMatch[1]) {
        embedSrc = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;
        isIframe = true;
      } else {
        const vimeoMatch = block.url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
        if (vimeoMatch && vimeoMatch[1]) {
          embedSrc = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
          isIframe = true;
        }
      }

      return (
        <figure className="my-10 w-full max-w-[760px] mx-auto">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-[#1E1D1B] shadow-md border border-[#DDD9D0]/50">
            {isIframe ? (
              <iframe
                src={embedSrc}
                title={block.caption || 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : (
              <video src={block.url} controls className="w-full h-full object-contain" />
            )}
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 text-center text-xs sm:text-sm italic text-[#716D65]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'embed': {
      if (!block.url) return null;
      let embedSrc = block.url;
      if (embedSrc.includes('open.spotify.com') && !embedSrc.includes('/embed/')) {
        embedSrc = embedSrc.replace('open.spotify.com/', 'open.spotify.com/embed/');
      } else if (embedSrc.includes('codepen.io') && embedSrc.includes('/pen/')) {
        embedSrc = embedSrc.replace('/pen/', '/embed/');
      } else if (embedSrc.includes('loom.com/share/')) {
        embedSrc = embedSrc.replace('loom.com/share/', 'loom.com/embed/');
      }

      return (
        <figure className="my-10 w-full max-w-[760px] mx-auto">
          <div className="w-full h-[380px] sm:h-[450px] rounded-xl overflow-hidden bg-white border border-[#DDD9D0] shadow-sm">
            <iframe
              src={embedSrc}
              title={block.caption || 'Embed'}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              loading="lazy"
              className="w-full h-full border-0"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 text-center text-xs sm:text-sm italic text-[#716D65]">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'divider': {
      return (
        <div className="my-12 flex items-center justify-center select-none">
          <div className="text-[#716D65]/40 tracking-[1em] text-xl">···</div>
        </div>
      );
    }

    case 'list': {
      const isNumbered = block.listType === 'numbered';
      const items = block.items || [];
      if (items.length === 0) return null;

      if (isNumbered) {
        return (
          <ol className="list-decimal list-outside pl-6 space-y-2.5 text-[#2E2A25] text-[18px] leading-[1.75] my-5">
            {items.map((it, i) => (
              <li key={i} className="pl-1" dangerouslySetInnerHTML={{ __html: it }} />
            ))}
          </ol>
        );
      }
      return (
        <ul className="list-disc list-outside pl-6 space-y-2.5 text-[#2E2A25] text-[18px] leading-[1.75] my-5">
          {items.map((it, i) => (
            <li key={i} className="pl-1" dangerouslySetInnerHTML={{ __html: it }} />
          ))}
        </ul>
      );
    }

    case 'callout': {
      const variant = block.variant || 'note';
      const configs = {
        note: { bg: 'bg-[#F4F1EA]', border: 'border-[#DDD9D0]', icon: Bookmark, iconColor: 'text-[#716D65]' },
        tip: { bg: 'bg-[#F0F4EE]', border: 'border-[#D0DDD0]', icon: Lightbulb, iconColor: 'text-emerald-700' },
        warning: { bg: 'bg-[#FAF4E8]', border: 'border-[#EADBB8]', icon: AlertTriangle, iconColor: 'text-amber-700' },
        info: { bg: 'bg-[#EEF2F5]', border: 'border-[#CED8E0]', icon: Info, iconColor: 'text-sky-700' },
      }[variant];
      const Icon = configs.icon;

      return (
        <div className={`my-8 p-6 rounded-2xl border ${configs.border} ${configs.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-4 h-4 ${configs.iconColor}`} />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#716D65]">
              {variant}
            </span>
          </div>
          <div
            className="text-base sm:text-[17px] leading-relaxed text-[#211E1A]"
            dangerouslySetInnerHTML={{ __html: block.content || '' }}
          />
        </div>
      );
    }

    case 'section': {
      return (
        <div className="my-14 py-8 border-y border-[#DDD9D0]/70 text-center space-y-2">
          {block.sectionNumber && (
            <span className="block text-xs font-mono uppercase tracking-[0.25em] text-[#716D65]">
              {block.sectionNumber}
            </span>
          )}
          {block.sectionTitle && (
            <h3
              className="font-editorial text-3xl sm:text-4xl text-[#211E1A] leading-tight"
              dangerouslySetInnerHTML={{ __html: block.sectionTitle }}
            />
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
