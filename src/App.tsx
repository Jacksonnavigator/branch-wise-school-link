
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Users from "./pages/Users";
import Branches from "./pages/Branches";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Results from "./pages/Results";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Settings from "./pages/Settings";
import Children from "./pages/Children";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="my-students" element={<Students />} />
              <Route path="children" element={<Children />} />
              <Route path="users" element={<Users />} />
              <Route path="branches" element={<Branches />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="reports" element={<Reports />} />
              <Route path="results" element={<Results />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
