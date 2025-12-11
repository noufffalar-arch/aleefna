import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import '@/i18n';

import Splash from "./pages/Splash";
import LanguageSelect from "./pages/LanguageSelect";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ShelterDashboard from "./pages/ShelterDashboard";
import ClinicDashboard from "./pages/ClinicDashboard";
import ClinicSettings from "./pages/ClinicSettings";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import Services from "./pages/Services";
import Store from "./pages/Store";
import History from "./pages/History";
import MissingReport from "./pages/MissingReport";
import StrayReport from "./pages/StrayReport";
import ReportsMap from "./pages/ReportsMap";
import BookAppointment from "./pages/BookAppointment";
import AddPet from "./pages/AddPet";
import Adoption from "./pages/Adoption";
import Care from "./pages/Care";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/language" element={<LanguageSelect />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/shelter-dashboard" element={<ShelterDashboard />} />
            <Route path="/clinic-dashboard" element={<ClinicDashboard />} />
            <Route path="/clinic-settings" element={<ClinicSettings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/services" element={<Services />} />
            <Route path="/store" element={<Store />} />
            <Route path="/history" element={<History />} />
            <Route path="/missing-report" element={<MissingReport />} />
            <Route path="/stray-report" element={<StrayReport />} />
            <Route path="/reports-map" element={<ReportsMap />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/add-pet" element={<AddPet />} />
            <Route path="/adoption" element={<Adoption />} />
            <Route path="/care" element={<Care />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
