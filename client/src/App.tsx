import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "./hooks/useAuth.tsx";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import Workspace from "@/pages/workspace";
import EmailTest from "@/pages/email-test";
import LandingPage from "@/pages/LandingPage";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/landing" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/workspace/:workspaceId" component={Workspace} />
      <ProtectedRoute path="/email-test" component={EmailTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;