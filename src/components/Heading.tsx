export const Heading = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div>
      <h1 className="text-2xl font-medium">{title}</h1>
      <p className="text-muted-foreground text-sm mt-2">{description}</p>
    </div>
  );
};
