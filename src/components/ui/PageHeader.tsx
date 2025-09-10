import React from 'react';

const PageHeader: React.FC<{ title: string; subtitle?: string; actions?: React.ReactNode }> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <div>
        <h2 className="text-3xl font-extrabold text-foreground bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
