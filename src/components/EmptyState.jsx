export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        {Icon && (
          <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full p-3 ring-8 ring-gray-50">
            <Icon className="h-full w-full text-gray-400" />
          </div>
        )}
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
        )}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}