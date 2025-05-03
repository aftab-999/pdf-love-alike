
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ToolsPage from "./pages/ToolsPage";
import MergePDF from "./pages/MergePDF";
import SplitPDF from "./pages/SplitPDF";
import PdfToImage from "./pages/PdfToImage";
import CompressPDF from "./pages/CompressPDF";
import NotFound from "./pages/NotFound";

// Initialize the query client outside of the component
const queryClient = new QueryClient();

// Make sure App is a proper function component
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Layout>
            <Routes>
              <Route path="/" element={<CompressPDF />} />
              <Route path="/compress-pdf" element={<CompressPDF />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/merge-pdf" element={<MergePDF />} />
              <Route path="/split-pdf" element={<SplitPDF />} />
              <Route path="/pdf-to-image" element={<PdfToImage />} />
              <Route path="/home" element={<HomePage />} />
              {/* More routes will be added as we implement them */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
