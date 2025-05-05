
import { PDFDocument } from 'pdf-lib';
import { compressPdfWithApi } from '@/services/pdfCompressService';

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
  
  // Calculate exact percentage needed for the target size
  const neededPercentage = Math.min(98, Math.max(5, 100 - (targetSize / originalSize * 100)));
  let compressionLevel = "medium";
  
  // Determine compression level based on needed percentage
  if (neededPercentage > 90) compressionLevel = "maximum"; // New highest level
  else if (neededPercentage > 80) compressionLevel = "extreme";
  else if (neededPercentage > 60) compressionLevel = "high";
  else if (neededPercentage > 30) compressionLevel = "medium";
  else compressionLevel = "low";
  
  return { 
    compressionPercentage: Math.round(neededPercentage),
    compressionLevel
  };
};

// Calculate estimated size based on compression percentage
export const calculateEstimatedSize = (
  originalSize: number,
  compressionPercentage: number
): number => {
  // More accurate algorithm for different compression levels
  // Higher compression percentages result in more aggressive size reduction
  const reductionFactor = compressionPercentage / 100;
  
  let compressionEfficiency;
  if (compressionPercentage < 30) {
    compressionEfficiency = 0.85; // Low compression, more realistic
  } else if (compressionPercentage < 60) {
    compressionEfficiency = 0.9; // Medium compression, improved
  } else if (compressionPercentage < 80) {
    compressionEfficiency = 0.95; // High compression, improved
  } else if (compressionPercentage < 90) {
    compressionEfficiency = 0.98; // Extreme compression, very efficient
  } else {
    compressionEfficiency = 0.99; // Maximum compression, extremely efficient
  }
  
  // Apply the compression calculation
  const minimumSize = 20 * 1024; // Allow down to 20KB minimum
  const estimatedSize = Math.max(originalSize * (1 - reductionFactor * compressionEfficiency), minimumSize);
  return Math.round(estimatedSize);
};

// Get compression percentage needed for exact target size
export const getCompressionForExactTargetSize = (
  originalSize: number,
  targetSizeKB: number
): number => {
  // Convert target KB to bytes
  const targetSizeBytes = targetSizeKB * 1024;
  
  // If target is larger than original, no compression needed
  if (targetSizeBytes >= originalSize) {
    return 10; // Minimum compression
  }
  
  // Calculate exact compression needed and apply adjustments for better accuracy
  let basePercentage = 100 - (targetSizeBytes / originalSize * 100);
  
  // Apply correction factors based on compression range
  if (basePercentage > 90) {
    // For maximum compression, be most aggressive
    basePercentage = Math.min(98, basePercentage * 1.05);
  } else if (basePercentage > 80) {
    // For extreme compression
    basePercentage = Math.min(95, basePercentage * 1.03);
  } else if (basePercentage > 60) {
    // For high compression
    basePercentage = basePercentage * 1.02;
  } else if (basePercentage > 30) {
    // For medium compression
    basePercentage = basePercentage * 1.01;
  }
  
  return Math.min(98, Math.max(10, Math.round(basePercentage)));
};

// Image quality settings based on compression level
const getImageQualityForLevel = (level: string): number => {
  switch (level) {
    case 'low': return 0.9;
    case 'medium': return 0.7;
    case 'high': return 0.5;
    case 'extreme': return 0.3;
    case 'maximum': return 0.1;
    default: return 0.7;
  }
};

// Gets target bytes for a compression level
const getTargetBytesForLevel = (originalSize: number, level: string): number => {
  const reductionFactors: Record<string, number> = {
    'low': 0.8,
    'medium': 0.6,
    'high': 0.4,
    'extreme': 0.2,
    'maximum': 0.1,
  };
  
  return Math.round(originalSize * (reductionFactors[level] || 0.6));
};

// Enhanced PDF compression function that uses the PDF.co API
export const compressPDF = async (file: File, compressionLevel: string, onProgress?: (progress: number) => void): Promise<Blob> => {
  try {
    // Convert compression level to percentage
    let compressionPercentage: number;
    switch(compressionLevel) {
      case 'low': compressionPercentage = 30; break;
      case 'medium': compressionPercentage = 60; break;
      case 'high': compressionPercentage = 80; break;
      case 'extreme': compressionPercentage = 90; break;
      case 'maximum': compressionPercentage = 95; break;
      default: compressionPercentage = 60; // medium is default
    }
    
    console.log(`Compressing with ${compressionLevel} level (${compressionPercentage}%)`);
    
    // Use the API service to compress the PDF
    return await compressPdfWithApi(file, compressionPercentage, onProgress || (() => {}));
    
  } catch (error) {
    console.error('Error compressing PDF:', error);
    throw new Error('PDF compression failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Compress to exact target size
export const compressPDFToTargetSize = async (
  file: File, 
  targetSizeKB: number, 
  onProgress?: (progress: number) => void
): Promise<Blob> => {
  try {
    // Calculate needed compression percentage to reach target size
    const compressionPercentage = getCompressionForExactTargetSize(file.size, targetSizeKB);
    
    console.log(`Compressing to target size: ${targetSizeKB}KB using ${compressionPercentage}% compression`);
    
    // Use the API service to compress the PDF
    return await compressPdfWithApi(file, compressionPercentage, onProgress || (() => {}));
    
  } catch (error) {
    console.error('Error compressing PDF to target size:', error);
    throw new Error('PDF compression to target size failed: ' + (error instanceof Error ? error.message : String(error)));
  }
};

// Create a download for the compressed PDF file
export const downloadPDF = (blob: Blob, filename: string): void => {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  
  // Clean up
  document.body.removeChild(downloadLink);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
