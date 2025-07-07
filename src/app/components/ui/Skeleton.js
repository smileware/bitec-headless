// Global Skeleton Loading Component
const Skeleton = ({ 
  width = "w-full", 
  height = "h-4", 
  className = "", 
  rounded = "rounded",
  animate = true 
}) => {
  return (
    <div 
      className={`bg-gray-300 ${width} ${height} ${rounded} ${animate ? 'animate-pulse' : ''} ${className}`}
    />
  );
};

// Predefined skeleton patterns for common use cases
export const SkeletonButton = ({ className = "" }) => (
  <div className={`flex items-center space-x-2 px-3 py-2 ${className}`}>
    <Skeleton width="w-5" height="h-4" rounded="rounded-sm" />
    <Skeleton width="w-8" height="h-4" />
    <Skeleton width="w-4" height="h-4" />
  </div>
);

export const SkeletonText = ({ lines = 1, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        width={index === lines - 1 ? "w-3/4" : "w-full"} 
        height="h-4" 
      />
    ))}
  </div>
);

export const SkeletonCard = ({ className = "" }) => (
  <div className={`p-4 bg-white border border-gray-300 rounded-md shadow-sm ${className}`}>
    <Skeleton width="w-full" height="h-6" className="mb-3" />
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonImage = ({ className = "" }) => (
  <Skeleton 
    width="w-full" 
    height="h-48" 
    rounded="rounded-md" 
    className={className}
  />
);

export const SkeletonAvatar = ({ size = "w-10 h-10", className = "" }) => (
  <Skeleton 
    width={size} 
    height={size} 
    rounded="rounded-full" 
    className={className}
  />
);

export const SkeletonList = ({ items = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3">
        <SkeletonAvatar size="w-8 h-8" />
        <div className="flex-1">
          <Skeleton width="w-1/2" height="h-4" className="mb-1" />
          <Skeleton width="w-3/4" height="h-3" />
        </div>
      </div>
    ))}
  </div>
);

export default Skeleton; 