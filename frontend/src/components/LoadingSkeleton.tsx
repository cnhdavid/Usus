export const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-card-bg border border-card-border rounded-2xl p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-1/3 shimmer"></div>
              <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4 shimmer"></div>
            </div>
            <div className="h-12 w-12 bg-slate-200 dark:bg-zinc-800 rounded-full shimmer"></div>
          </div>
          <div className="h-12 bg-slate-200 dark:bg-zinc-800 rounded-xl shimmer"></div>
        </div>
      ))}
    </div>
  );
};
