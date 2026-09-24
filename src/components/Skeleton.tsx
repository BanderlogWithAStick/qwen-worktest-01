import { motion } from 'framer-motion';

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-28 bg-gray-100 rounded animate-pulse mb-2" />
      <div className="h-4 w-36 bg-gray-100 rounded animate-pulse" />
    </motion.div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="h-6 w-40 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-7 h-7 bg-gray-100 rounded-full animate-pulse" />
            <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
            <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-16 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-4" />
      <div className="h-64 bg-gray-50 rounded-lg animate-pulse" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} delay={i * 0.05} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonTable />
      </div>
    </div>
  );
}
