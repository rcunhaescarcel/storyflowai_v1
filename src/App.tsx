import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Editor from "./Editor";
import Render from "./pages/Render";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import Videos from "./pages/Videos";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { SessionProvider } from "./contexts/SessionContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { SvgGradients } from "@/components/ui/SvgGradients";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RenderProvider } from "./contexts/RenderContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider storageKey="storyflow-theme">
          <RenderProvider>
            <TooltipProvider>
              <SvgGradients />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/render" element={<Render />} />

                  {/* Protected App Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/editor" element={<Editor />} />
                      <Route path="/videos" element={<Videos />} />
                      <Route path="/settings" element={<Settings />} />
                    </Route>
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </RenderProvider>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default App;