import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Editor from "./pages/Editor";
import Render from "./pages/Render";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import Videos from "./pages/Videos";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component rendering...");
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/render" element={<Render />} />
            
            {/* App Routes with Layout */}
            <Route element={<AppLayout />}>
              <Route path="/editor" element={<Editor />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;