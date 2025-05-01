
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import ToolsPage from "./pages/ToolsPage";
import MergePDF from "./pages/MergePDF";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/merge-pdf" element={<MergePDF />} />
            {/* In a real implementation, we would add routes for all tools */}
            {/* <Route path="/pdf-to-image" element={<PdfToImage />} /> */}
            {/* <Route path="/image-to-pdf" element={<ImageToPdf />} /> */}
            {/* <Route path="/split-pdf" element={<SplitPdf />} /> */}
            {/* <Route path="/compress-pdf" element={<CompressPdf />} /> */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
