"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
};

const markdownComponents: Components = {
  a({ children, ...props }) {
    return (
      <a
        {...props}
        className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-700"
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-slate-300 pl-3 text-slate-600">
        {children}
      </blockquote>
    );
  },
  code({ children, className }) {
    const isBlock = className?.startsWith("language-");

    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs leading-5 text-slate-100">
          {children}
        </code>
      );
    }

    return (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800">
        {children}
      </code>
    );
  },
  h1({ children }) {
    return <h1 className="text-xl font-semibold text-slate-950">{children}</h1>;
  },
  h2({ children }) {
    return <h2 className="text-lg font-semibold text-slate-950">{children}</h2>;
  },
  h3({ children }) {
    return <h3 className="text-base font-semibold text-slate-950">{children}</h3>;
  },
  hr() {
    return <hr className="border-slate-200" />;
  },
  ol({ children }) {
    return <ol className="list-decimal space-y-1 pl-5">{children}</ol>;
  },
  p({ children }) {
    return <p>{children}</p>;
  },
  pre({ children }) {
    return <pre className="overflow-x-auto whitespace-pre-wrap">{children}</pre>;
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          {children}
        </table>
      </div>
    );
  },
  td({ children }) {
    return <td className="border border-slate-200 px-2 py-1.5">{children}</td>;
  },
  th({ children }) {
    return (
      <th className="border border-slate-200 bg-slate-50 px-2 py-1.5 font-semibold">
        {children}
      </th>
    );
  },
  ul({ children }) {
    return <ul className="list-disc space-y-1 pl-5">{children}</ul>;
  },
};

export default function MarkdownMessage({ content }: Props) {
  return (
    <div className="markdown-message space-y-3 break-words">
      <ReactMarkdown
        components={markdownComponents}
        remarkPlugins={[remarkGfm]}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
