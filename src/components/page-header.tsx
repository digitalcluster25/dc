interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="py-2 md:py-4">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-4xl font-bold tracking-tighter text-foreground sm:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-lg text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
