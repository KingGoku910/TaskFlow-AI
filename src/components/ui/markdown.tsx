// @/components/ui/markdown.tsx
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { visit } from 'unist-util-visit';

function rehypeRemoveClassNames() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.properties && node.properties.className) {
        delete node.properties.className;
      }
    });
  };
}
import { cn } from '@/lib/utils';

interface MarkdownProps {
  children: string;
  className?: string;
  compact?: boolean;
}

export function Markdown({ children, className, compact = false }: MarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert",
        compact && "prose-compact",
        "prose-headings:text-foreground prose-p:text-muted-foreground",
        "prose-strong:text-foreground prose-code:text-foreground",
        "prose-blockquote:text-muted-foreground prose-li:text-muted-foreground",
        "prose-a:text-primary hover:prose-a:text-primary/80",
        "prose-pre:bg-muted prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-headings:font-semibold prose-h1:text-lg prose-h2:text-base prose-h3:text-sm",
        "prose-p:leading-relaxed prose-li:leading-relaxed",
        compact && "prose-p:mb-1 prose-headings:mb-1 prose-li:mb-0",
        "max-w-none",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRemoveClassNames]}
        components={{
          // Custom component styling for compact mode
          h1: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <h1 {...restProps} className={cn("text-sm font-semibold mb-1", compact && "text-xs")}>
              {children}
            </h1>
          );},
          h2: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <h2 {...restProps} className={cn("text-sm font-semibold mb-1", compact && "text-xs")}>
              {children}
            </h2>
          );},
          h3: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <h3 {...restProps} className={cn("text-xs font-semibold mb-1", compact && "text-xs")}>
              {children}
            </h3>
          );},
          p: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <p {...restProps} className={cn("text-sm text-muted-foreground mb-1 leading-relaxed", compact && "text-xs mb-0.5")}>
              {children}
            </p>
          );},
          ul: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <ul {...restProps} className={cn("list-disc pl-4 space-y-0.5", compact && "text-xs")}>
              {children}
            </ul>
          );},
          ol: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <ol {...restProps} className={cn("list-decimal pl-4 space-y-0.5", compact && "text-xs")}>
              {children}
            </ol>
          );},
          li: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <li {...restProps} className={cn("text-sm text-muted-foreground", compact && "text-xs")}>
              {children}
            </li>
          );},
          code: ({ children, inline, ...props }) => {
            // Ensure no className prop is passed from the component's own props
            const { className, ...restProps } = props;

            return inline ? (
              <code
                {...restProps}
                className={cn(
                  "bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground",
                  compact && "text-xs"
                )}
              >
                {children}
              </code>
            ) : (
              // For block code, rely on rehypeHighlight to add the necessary classes.
              // We explicitly do not pass any 'className' from our component's props.
              <code {...restProps}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <pre
              {...restProps}
              className={cn(
                "bg-muted p-2 rounded text-xs overflow-x-auto font-mono",
                compact && "p-1 text-xs"
              )}
            >
              {children}
            </pre>
          );},
          blockquote: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <blockquote
              {...restProps}
              className={cn(
                "border-l-4 border-primary pl-3 py-1 text-sm text-muted-foreground italic",
                compact && "text-xs pl-2"
              )}
            >
              {children}
            </blockquote>
          );},
          strong: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <strong {...restProps} className={cn("font-semibold text-foreground", compact && "text-xs")}>
              {children}
            </strong>
          );},
          em: ({ children, ...props }) => { const { className: _, ...restProps } = props; return (
            <em {...restProps} className={cn("italic text-muted-foreground", compact && "text-xs")}>
              {children}
            </em>
          );},
          a: ({ children, href, ...props }) => { const { className: _, ...restProps } = props; return (
            <a
              {...restProps}
              href={href}
              className={cn(
                "text-primary hover:text-primary/80 underline underline-offset-2",
                compact && "text-xs"
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );},
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
