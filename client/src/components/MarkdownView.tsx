import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownViewProps {
  content: string;
}

export function MarkdownView({ content }: MarkdownViewProps) {
  return (
    <div className="prose-editorial max-w-none text-[#2E2A25]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const isInline = !className && !String(children).includes('\n');
            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="p-4 bg-[#F3F1EB] rounded border border-[#DDD9D0] overflow-x-auto text-sm my-6">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          a({ href, children }: any) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#211E1A] underline decoration-[#8A867E] hover:decoration-[#211E1A] transition-colors"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
