import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function SignupDialog({ externalOpen, onExternalOpenChange }: { externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void } = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({ email: "", password: "", passwordConfirm: "" });
  const [signupError, setSignupError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setSignupError("");
  };

  const validate = () => {
    const newErrors = { email: "", password: "", passwordConfirm: "" };
    if (formData.password.length < 8) newErrors.password = "Parool peab olema vähemalt 8 tähemärki";
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Paroolid ei kattu";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Kinnituslink saadeti sinu e-mailile. Kontrolli oma postkasti!");
        setFormData({ first_name: "", last_name: "", email: "", password: "", passwordConfirm: "" });
      } else {
        setSignupError(data.error || "Registreerimine ebaõnnestus.");
      }
    } catch (err) {
      console.error(err);
      setSignupError("Midagi läks valesti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" />
          Registreeru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-center">Loo konto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">Eesnimi</Label>
            <Input id="first_name" name="first_name" placeholder="Mari" value={formData.first_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">Perekonnanimi</Label>
            <Input id="last_name" name="last_name" placeholder="Maasikas" value={formData.last_name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input id="email" name="email" type="email" placeholder="mari@näide.ee" value={formData.email} onChange={handleChange} required />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parool</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Kinnita parool</Label>
            <Input id="passwordConfirm" name="passwordConfirm" type="password" placeholder="••••••••" value={formData.passwordConfirm} onChange={handleChange} required />
            {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm}</p>}
          </div>

          {signupError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{signupError}</p>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {successMessage}
            </div>
          )}

          {!successMessage && (
            <>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registreeru
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">või</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Button type="button" onClick={handleGoogleSignup} className="w-full gap-2">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
