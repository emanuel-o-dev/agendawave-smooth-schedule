import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppSidebar } from "@/components/Layout/AppSidebar";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewAppointment from "./pages/NewAppointment";
import CalendarView from "./pages/CalendarView";
import Metrics from "./pages/Metrics";
import Profile from "./pages/Profile";
import PublicBooking from "./pages/PublicBooking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
   const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
      <div className="min-h-screen flex w-full">
        <AppSidebar isAdmin={isAdmin} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="/agendar" element={<PublicBooking />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-appointment" element={<NewAppointment />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
