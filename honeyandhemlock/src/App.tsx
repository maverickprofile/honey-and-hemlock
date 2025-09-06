
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import Index from "./pages/Index";
import Films from "./pages/Films";
import FilmGallery from "./pages/FilmGallery";
import PricingPage from "./pages/PricingPage";
import ScriptPortal from "./pages/ScriptPortal";
import Sponsorship from "./pages/Sponsorship";
import AdminLogin from "./pages/AdminLogin";
import ContractorLogin from "./pages/ContractorLogin";
import ContractorSignup from "./pages/ContractorSignup";
import AdminDashboard from "./pages/AdminDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import JudgeLogin from "./pages/JudgeLogin";
import ContractorsPanel from "./pages/ContractorsPanel";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ScrollToTopWrapper = () => {
  useScrollToTop();
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTopWrapper />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/films" element={<Films />} />
            <Route path="/film-gallery/:filmName" element={<FilmGallery />} />
            <Route path="/script-portal" element={<PricingPage />} />
            <Route path="/script-upload" element={<ScriptPortal />} />
            <Route path="/sponsorship" element={<Sponsorship />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/contractor" element={<ContractorLogin />} />
            <Route path="/contractor-signup" element={<ContractorSignup />} />
            <Route path="/judge-signup" element={<ContractorSignup />} />
            <Route path="/judge" element={<JudgeLogin />} />
            <Route path="/judge-login" element={<JudgeLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/contractor-dashboard" element={<ContractorDashboard />} />
            <Route path="/contractors" element={<ContractorsPanel />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
