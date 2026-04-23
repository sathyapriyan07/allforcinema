interface MaterialSymbolProps {
  name: string;
  className?: string;
}

export function MaterialSymbol({ name, className = '' }: MaterialSymbolProps) {
  return (
    <span className={`material-symbols-rounded ${className}`}>
      {name}
    </span>
  );
}