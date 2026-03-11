import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import ProtectedRoute from "@/routes/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppShell from "./components/app/AppShell";
import Dashboard from "./pages/app/Dashboard";
import Applications from "./pages/app/Applications";
import Resumes from "./pages/app/Resumes";
import Profile from "./pages/app/Profile";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />}/>
            <Route path="/login" element={<Login />}/>
            <Route path="/register" element={<Register />}/>
            <Route path="/app" element={<ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>}>
              <Route path="dashboard" element={<Dashboard />}/>
              <Route path="applications" element={<Applications />}/>
              <Route path="resumes" element={<Resumes />}/>
              <Route path="profile" element={<Profile />}/>
            </Route>
            <Route path="*" element={<NotFound />}/>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>);
export default App;
