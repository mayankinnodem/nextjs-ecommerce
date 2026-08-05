export default function CategoryHero({ category }) {
  const name = category.name || "";
  const description = category.description || "";

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
      <div className="page-container py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {category?.image?.url ? (
            <img
              src={category.image.url}
              alt={name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-full border-4 border-white/30 bg-white/10 shrink-0"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold shrink-0">
              {name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{name}</h1>
            {description ? (
              <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-2xl">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
