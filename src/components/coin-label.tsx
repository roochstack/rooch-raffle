interface CoinLabelProps {
  name: string;
  iconString?: string;
}

export const CoinLabel = ({ name, iconString }: CoinLabelProps) => {
  return (
    <div className="flex items-center gap-2">
      {iconString && (
        <span className="h-4 w-4 bg-cover" dangerouslySetInnerHTML={{ __html: iconString }} />
      )}
      <span>{name}</span>
    </div>
  );
};
