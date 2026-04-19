import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthPage from "./pages/Auth.tsx";
import SuperAdmin from "./pages/SuperAdmin.tsx";
import SchoolPage from "./pages/SchoolPage.tsx";
import People from "./pages/People.tsx";
import SchoolOnboarding from "./pages/SchoolOnboarding.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={["super_admin"]}><SuperAdmin /></ProtectedRoute>} />
            <Route path="/school" element={<ProtectedRoute><SchoolPage /></ProtectedRoute>} />
            <Route path="/school/onboarding" element={<ProtectedRoute allowedRoles={["principal","admin"]}><SchoolOnboarding /></ProtectedRoute>} />
            <Route path="/people" element={<ProtectedRoute allowedRoles={["principal","admin"]}><People /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
