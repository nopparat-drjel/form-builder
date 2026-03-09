import type { ReactNode } from "react";

interface PrintLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * A4 print wrapper — use around print-targeted content.
 * Screen: white card centered. Print: actual A4 with no shadow.
 */
export function PrintLayout({ children, title }: PrintLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-300 flex items-start justify-center py-8 print:bg-white print:py-0 print:block">
      <article
        className={[
          "bg-white w-[210mm] min-h-[297mm] px-12 py-10",
          "shadow-neu rounded-2xl",
          "print:shadow-none print:rounded-none print:m-0",
          "font-sarabun text-gray-800",
        ].join(" ")}
      >
        {title && (
          <header className="mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold font-prompt text-green-900">
              {title}
            </h1>
          </header>
        )}
        {children}
      </article>
    </div>
  );
}

export default PrintLayout;
