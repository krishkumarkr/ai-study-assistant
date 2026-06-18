import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighLighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="prose prose-invert prose-emerald max-w-none text-zinc-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 tracking-tight" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-5 border-b border-white/5 pb-1" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-emerald-50 mb-2 mt-4" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold text-zinc-100 mb-2 mt-4 uppercase tracking-wider" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 text-zinc-300 last:mb-0" {...props} />,
          a: ({ node, ...props }) => <a className="text-emerald-400 font-bold hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-colors" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4 space-y-2 marker:text-emerald-500" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4 space-y-2 marker:text-emerald-500 font-medium" {...props} />,
          li: ({ node, ...props }) => <li className="text-zinc-300" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-emerald-50 shadow-[0_0_10px_rgba(16,185,129,0.1)]" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-zinc-400" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-emerald-500/50 bg-emerald-500/5 px-6 py-4 rounded-r-2xl italic my-6" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <div className="relative my-6 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{match[1]}</span>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                    </div>
                </div>
              <SyntaxHighLighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        fontSize: '0.85rem',
                        lineHeight: '1.6',
                        background: 'transparent'
                    }}
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighLighter>
            </div>
            ) : (
              <code className="bg-white/10 text-emerald-300 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ node, ...props }) => <pre className="bg-transparent" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
