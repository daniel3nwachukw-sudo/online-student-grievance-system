type StatCardProps = {
  title: string;
  value: number | string;
  color?: string;
};

export default function StatCard({
  title,
  value,
  color = 'text-gray-900',
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow border p-6">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </h2>
    </div>
  );
}