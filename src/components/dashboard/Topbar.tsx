'use client';

type TopbarProps = {
  title: string;
};

export default function Topbar({ title }: TopbarProps) {
  return (
    <header className="h-20 bg-white border-b px-8 flex items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}