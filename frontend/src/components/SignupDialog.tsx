import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Loader2 } from "lucide-react";

export function SignupDialog({ externalOpen, onExternalOpenChange }: { externalOpen?: boolean; onExternalOpenChange?: (open: boolean) => void } = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onExternalOpenChange || setInternalOpen;

  const [formData, setFormData] = useState({first_name:"",last_name:"",email: "", password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({ email: "", password: "", passwordConfirm: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = { email: "", password: "", passwordConfirm: "" };
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = "Passwords do not match";
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({first_name: formData.first_name, last_name: formData.last_name, email: formData.email, password: formData.password }),
      });
      const data = await res.json();

      if (res.ok) {
        toast({ title: "Registreerimine", description: "Kasutaja loodud. Kontrolli oma e-posti!" });
        setFormData({ first_name:"",last_name:"",email: "", password: "", passwordConfirm: "" });
        setOpen(false);
      } else {
        toast({ title: "Viga", description: data.error || "Registreerimine ebaõnnestus.", variant: "destructive" });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Viga", description: "Midagi läks valesti.", variant: "destructive" });
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
          <DialogTitle className="font-display text-2xl">Loo konto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">Eesnimi</Label>
          <Input
            id="first_name"
            name="first_name"
            placeholder="Mari"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Perekonnanimi</Label>
          <Input
            id="last_name"
            name="last_name"
            placeholder="Maasikas"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mari@näide.ee"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Parool</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="passwordConfirm">Kinnita parool</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
            />
            {errors.passwordConfirm && <p className="text-sm text-destructive">{errors.passwordConfirm}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registreeru
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
  


}