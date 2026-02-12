import React from "react";

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="space-y-1.5">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-zinc-500 text-sm md:text-base font-medium max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;
