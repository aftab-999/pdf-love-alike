
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  else if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  else if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  else return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

// Calculate compression percentage between two file sizes
export const calculateCompressionPercentage = (originalSize: number, compressedSize: number): number => {
  if (originalSize === 0) return 0;
  const percentage = 100 - (compressedSize / originalSize) * 100;
  return Math.round(percentage);
};

// Get appropriate compression level based on target size and original size
export const getCompressionLevelForTargetSize = (
  originalSize: number, 
  targetSize: number
): { compressionPercentage: number; compressionLevel: string } => {
  if (originalSize === 0) {
    return { compressionPercentage: 50, compressionLevel: "medium" };
  }
  
  const neededPercentage = Math.min(95, Math.max(5, 100 - (targetSize / originalSize * 100)));
  let compressionLevel = "medium";
  
  if (neededPercentage > 85) compressionLevel = "extreme";
  else if (neededPercentage > 60) compressionLevel = "high";
  else if (neededPercentage > 30) compressionLevel = "medium";
  else compressionLevel = "low";
  
  return { 
    compressionPercentage: Math.round(neededPercentage),
    compressionLevel
  };
};
