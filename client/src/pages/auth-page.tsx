import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MessageSquare, Users, Zap, Shield } from "lucide-react";

export default function AuthPage() {
  const { user, login } = useAuth();
  const [, setLocation] = useLocation();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        setLocation("/");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const success = await login(registerData.email, registerData.password);
      if (success) {
        setLocation("/");
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: "Super Admin", email: "superadmin@test.com", password: "superadmin123" },
    { role: "Admin", email: "admin@test.com", password: "admin123" },
    { role: "User", email: "user@test.com", password: "user123" },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setLoginData({ email, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left Column - Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-primary rounded-lg p-2">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-3xl font-bold">CollabSpace</h1>
              </div>
              <p className="text-xl text-muted-foreground">
                The modern collaboration platform that brings teams together with AI-powered features
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-2">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Team Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Create workspaces, channels, and direct messages to keep your team connected
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-50 dark:bg-green-950 rounded-lg p-2">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Features</h3>
                  <p className="text-sm text-muted-foreground">
                    Smart suggestions, sentiment analysis, and automated task generation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-2">
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Role-Based Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive permission system with Super Admin, Admin, and User roles
                  </p>
                </div>
              </div>
            </div>

            {/* Demo Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demo Accounts</CardTitle>
                <CardDescription>
                  Try different roles with these test accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {demoCredentials.map((cred) => (
                  <div key={cred.role} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{cred.role}</p>
                      <p className="text-sm text-muted-foreground">{cred.email}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    >
                      Use
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Auth Forms */}
          <div className="max-w-md mx-auto w-full">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData((prev) => ({ ...prev, password: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an account</CardTitle>
                    <CardDescription>
                      Sign up to get started with CollabSpace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            placeholder="John"
                            value={registerData.firstName}
                            onChange={(e) =>
                              setRegisterData((prev) => ({ ...prev, firstName: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={registerData.lastName}
                            onChange={(e) =>
                              setRegisterData((prev) => ({ ...prev, lastName: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerEmail">Email</Label>
                        <Input
                          id="registerEmail"
                          type="email"
                          placeholder="Enter your email"
                          value={registerData.email}
                          onChange={(e) =>
                            setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="registerPassword">Password</Label>
                        <Input
                          id="registerPassword"
                          type="password"
                          placeholder="Create a password"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}