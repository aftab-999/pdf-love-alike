
/**
 * PDF Compression Service using PDF.co Web API
 * This service connects to the PDF.co API to provide real PDF compression
 */

// Types for the API responses
interface PdfCompressResponse {
  jobId: string;
  url: string;
  error?: string;
  status?: string;
}

interface PdfCompressJobResponse {
  status: string;
  url: string;
  error?: string;
}

// Set your PDF.co API key here - this should be moved to env variables
const API_KEY = "YOUR_PDF_CO_API_KEY"; // User will need to replace this

/**
 * Submits a PDF for compression using PDF.co API
 * @param fileUrl URL of the PDF file to compress
 * @param compressionLevel Compression level (1-100)
 * @returns Promise with the compression job details
 */
export const submitPdfCompressionJob = async (
  fileUrl: string,
  compressionLevel: number
): Promise<PdfCompressResponse> => {
  // Convert compression level to PDF.co expected values (1-100)
  // Our level (5-98) -> PDF.co level (1-100)
  const apiCompressionLevel = Math.min(100, Math.max(1, Math.round(compressionLevel)));
  
  try {
    const response = await fetch("https://api.pdf.co/v1/pdf/optimize/add", {
      method: "POST",
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: fileUrl,
        async: true,
        profiles: {
          compression: apiCompressionLevel,
          imageQuality: Math.max(10, 100 - apiCompressionLevel),
        }
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      jobId: data.jobId,
      url: data.url,
      status: "pending"
    };
  } catch (error) {
    console.error("Error submitting PDF compression job:", error);
    throw new Error(`PDF compression failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Checks the status of a PDF compression job
 * @param jobId The job ID to check
 * @returns Promise with the job status details
 */
export const checkPdfCompressionJob = async (
  jobId: string
): Promise<PdfCompressJobResponse> => {
  try {
    const response = await fetch(`https://api.pdf.co/v1/job/check?jobid=${jobId}`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      status: data.status,
      url: data.url || ""
    };
  } catch (error) {
    console.error("Error checking PDF compression job:", error);
    throw new Error(`Failed to check job status: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Downloads a compressed PDF file from the provided URL
 * @param url URL of the compressed PDF
 * @returns Promise with the file as Blob
 */
export const downloadCompressedPdf = async (url: string): Promise<Blob> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download compressed PDF: ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error("Error downloading compressed PDF:", error);
    throw new Error(`Download failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Helper to create a temporary URL for a file
 * @param file File object to create URL for
 * @returns Promise with temporary URL string
 */
export const createTemporaryFileUrl = async (file: File): Promise<string> => {
  // In a real implementation, this would upload to a temporary storage
  // For now, we'll create a data URL as a simplified approach
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
};

/**
 * Complete PDF compression process using PDF.co API
 * @param file File to compress
 * @param compressionPercentage Compression percentage (5-98)
 * @returns Promise with compressed file as Blob and progress updates via callback
 */
export const compressPdfWithApi = async (
  file: File, 
  compressionPercentage: number,
  onProgress: (progress: number) => void
): Promise<Blob> => {
  try {
    // Step 1: Create temporary URL for the file (in real app, upload to server)
    onProgress(10);
    const fileUrl = await createTemporaryFileUrl(file);
    
    // Step 2: Submit compression job to API
    onProgress(25);
    const jobDetails = await submitPdfCompressionJob(fileUrl, compressionPercentage);
    
    // Step 3: Poll for job completion
    onProgress(40);
    let status = "pending";
    let resultUrl = "";
    
    while (status === "pending" || status === "working") {
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check current job status
      const jobStatus = await checkPdfCompressionJob(jobDetails.jobId);
      status = jobStatus.status;
      
      if (status === "success") {
        resultUrl = jobStatus.url;
        onProgress(75);
        break;
      } else if (status === "error" || status === "failed") {
        throw new Error("PDF compression job failed");
      }
      
      // Update progress (gradually move from 40 to 70%)
      onProgress(Math.min(70, 40 + Math.random() * 5));
    }
    
    // Step 4: Download the compressed file
    if (!resultUrl) {
      throw new Error("No result URL provided");
    }
    
    const compressedFile = await downloadCompressedPdf(resultUrl);
    onProgress(100);
    
    return compressedFile;
  } catch (error) {
    console.error("PDF compression failed:", error);
    throw new Error(`API compression failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
