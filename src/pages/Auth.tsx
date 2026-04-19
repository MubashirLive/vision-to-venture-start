import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "At least 8 characters").max(100);
const nameSchema = z.string().trim().min(2, "Enter your name").max(100);

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  // login
  const [li, setLi] = useState({ email: "", password: "" });
  // signup
  const [su, setSu] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (!loading && user) navigate("/", { replace: true });
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const ev = emailSchema.safeParse(li.email);
    const pv = passwordSchema.safeParse(li.password);
    if (!ev.success) return toast({ title: "Invalid email", description: ev.error.errors[0].message, variant: "destructive" });
    if (!pv.success) return toast({ title: "Invalid password", description: pv.error.errors[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: ev.data, password: pv.data });
    setBusy(false);
    if (error) return toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    navigate("/", { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const nv = nameSchema.safeParse(su.name);
    const ev = emailSchema.safeParse(su.email);
    const pv = passwordSchema.safeParse(su.password);
    if (!nv.success) return toast({ title: "Invalid name", description: nv.error.errors[0].message, variant: "destructive" });
    if (!ev.success) return toast({ title: "Invalid email", description: ev.error.errors[0].message, variant: "destructive" });
    if (!pv.success) return toast({ title: "Weak password", description: pv.error.errors[0].message, variant: "destructive" });

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: ev.data,
      password: pv.data,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: nv.data },
      },
    });
    setBusy(false);
    if (error) {
      const msg = error.message.toLowerCase().includes("already") ? "Account already exists. Please sign in." : error.message;
      return toast({ title: "Sign up failed", description: msg, variant: "destructive" });
    }
    toast({ title: "Account created", description: "You can now sign in." });
  };

  return (
    <div className="min-h-screen bg-gradient-soft grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground mb-3 shadow-elegant">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">SHARP</h1>
          <p className="text-sm text-muted-foreground">School Management for India</p>
        </div>
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your school account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger value="login">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="li-email">Email</Label>
                    <Input id="li-email" type="email" autoComplete="email" required value={li.email}
                      onChange={(e) => setLi({ ...li, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="li-pwd">Password</Label>
                    <Input id="li-pwd" type="password" autoComplete="current-password" required value={li.password}
                      onChange={(e) => setLi({ ...li, password: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="su-name">Full name</Label>
                    <Input id="su-name" required value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" autoComplete="email" required value={su.email}
                      onChange={(e) => setSu({ ...su, email: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pwd">Password</Label>
                    <Input id="su-pwd" type="password" autoComplete="new-password" required value={su.password}
                      onChange={(e) => setSu({ ...su, password: e.target.value })} />
                    <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing you agree to SHARP's terms of service.
        </p>
      </div>
    </div>
  );
}
