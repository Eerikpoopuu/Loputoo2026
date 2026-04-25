import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { createStripeCheckout, type SubscriptionOrderData } from "@/lib/api";
import { Check, Flower2, Loader2, Gift } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import GoogleAutocomplete from "react-google-autocomplete";




const specialDates = [{ value: "valentines", label: "Sõbrapäev", date: "14. veebruar" },
  { value: "mothers_day", label: "Emadepäev", date: "10.mai" },
  { value: "womens_day", label: "Naistepäev", date: "8. märts" },
  { value: "christmas", label: "Jõulud", date: "24. detsember" },
];

const schema = z.object({
  first_name: z.string().trim().min(1, "Eesnimi on kohustuslik").max(100),
  last_name: z.string().trim().min(1, "Perekonnanimi on kohustuslik").max(100),
  phone: z.string().trim().min(1, "Telefon on kohustuslik").max(50),
  delivery_address: z.string().trim().min(1, "Tarneaadress on kohustuslik").max(1000),
  bouquet: z.enum(["small", "medium", "large"], { required_error: "Palun vali kimbu suurus" }),
  period: z.enum(["weekly", "monthly"], { required_error: "Palun vali periood" }),
  special_dates: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const bouquetOptions = [
  { value: "small" as const, label: "Väike", price: "19,00 €" },
  { value: "medium" as const, label: "Keskmine", price: "29,00 €" },
  { value: "large" as const, label: "Suur", price: "39,00 €" },
];

const priceMap: Record<"small" | "medium" | "large", Record<"weekly" | "monthly", string>> = {
  small:  { weekly: "price_1TN6epLuP39BUGmfTvn7J12E", monthly: "price_1T9kcZLuP39BUGmfbUITjNsP" },
  medium: { weekly: "price_1TN6fbLuP39BUGmfo1REDXWW", monthly: "price_1T9kczLuP39BUGmf3hxAkHUI" },
  large:  { weekly: "price_1TN6gGLuP39BUGmfQGmX35S4", monthly: "price_1T9kdHLuP39BUGmfhEPPHgbO" },
};

const periodOptions = [
  { value: "weekly" as const, label: "Iganädalane" },
  { value: "monthly" as const, label: "Igakuine" },
];

export default function SubscriptionForm({ preselectedBouquet }: { preselectedBouquet?: "small" | "medium" | "large" }) {
  const {isLoggedIn,user} =useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const token = localStorage.getItem("token");

  const {register,handleSubmit,watch,setValue,formState: { errors },} = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { special_dates: [] },});

  useEffect(() => {
    if (preselectedBouquet) {
      setValue("bouquet", preselectedBouquet, { shouldValidate: true });
    }
  }, [preselectedBouquet]);

  const selectedBouquetValue = watch("bouquet");
  const selectedPeriod = watch("period");
  const priceId = selectedBouquetValue && selectedPeriod
    ? priceMap[selectedBouquetValue][selectedPeriod]
    : undefined;
  const selectedSpecialDates = watch("special_dates") || [];

  const toggleSpecialDate = (value: string) => {
    const current = selectedSpecialDates;
    const updated = current.includes(value)
      ? current.filter((d) => d !== value)
      : [...current, value];
    setValue("special_dates", updated);
  };
  

  const onSubmit = async (data: FormData) => {
    if (!isLoggedIn || !user) {
      toast({
        title: "Logi sisse",
        description: "Tellimuse esitamiseks pead sisse logima",
        variant: "destructive",
      });
      return;
    }

    if (!priceId) {
      toast({
        title: "Viga",
        description: "Palun vali kimbu suurus",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Seanss aegunud",
        description: "Palun logi uuesti sisse",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
      const payload: SubscriptionOrderData = {
        first_name: capitalize(data.first_name),
        last_name: capitalize(data.last_name),
        phone: data.phone,
        delivery_address: data.delivery_address,
        bouquet: data.bouquet,
        period: data.period,
        special_dates: data.special_dates,
      };

      const checkoutUrl = await createStripeCheckout(priceId, payload, token);

      toast({
        title: "Suuname maksma...",
        description: "Kohe suunatakse sind Stripe makselehele.",
      });

      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 800);
    } catch (error) {
      toast({
        title: "Viga",
        description: error instanceof Error ? error.message : "Midagi läks valesti. Palun proovi uuesti.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  

  if (isSuccess) {
    return (
      <section id="tellimus" className="py-20 px-4">
        <div className="container max-w-lg mx-auto">
          <Card className="text-center shadow-xl border-0 bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-10 w-10 text-primary" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-3 text-foreground">Aitäh!</h2>
              <p className="text-muted-foreground text-lg">
                Sinu lillede tellimus on edukalt vastu võetud.
              </p>
              <Flower2 className="mx-auto mt-6 h-8 w-8 text-primary animate-float" />
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="tellimus" className="py-20 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-4xl font-bold text-foreground mb-3">Telli oma lilled</h2>
          <p className="text-muted-foreground text-lg">Täida allolev vorm ja me toome ilu sinu koju</p>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Tellimisvorm</CardTitle>
            <CardDescription>Kõik väljad on kohustuslikud</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Name fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Eesnimi</Label>
                  <Input id="first_name" placeholder="Mari" {...register("first_name")} />
                  {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Perekonnanimi</Label>
                  <Input id="last_name" placeholder="Maasikas" {...register("last_name")} />
                  {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+372 5123 4567" {...register("phone")} />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_address">Tarneaadress</Label>
                  <GoogleAutocomplete
                    apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                    onPlaceSelected={(place) => {
                      setValue("delivery_address", place.formatted_address || "", { shouldValidate: true });
                    }}
                    options={{ types: ["address"], componentRestrictions: { country: "ee" } }}
                    defaultValue=""
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    placeholder="Tänav 1, Linn, Postiindeks"
                    id="delivery_address"
                />
                  {errors.delivery_address && <p className="text-sm text-destructive">{errors.delivery_address.message}</p>}
                </div>
              </div>

              {/* Bouquet selection */}
              <div className="space-y-3">
                <Label>Kimbu suurus</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {bouquetOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("bouquet", opt.value, { shouldValidate: true })}
                      className={`rounded-lg border-2 p-4 text-center transition-all hover:border-primary/60 ${
                        selectedBouquetValue === opt.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border"
                      }`}
                    >
                      <span className="block font-display text-lg font-semibold text-foreground">{opt.label}</span>
                      <span className="block text-sm text-muted-foreground mt-1">{opt.price}</span>
                    </button>
                  ))}
                </div>
                {errors.bouquet && <p className="text-sm text-destructive">{errors.bouquet.message}</p>}
              </div>

              {/* Period selection */}
              <div className="space-y-3">
                <Label>Tellimuse periood</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {periodOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("period", opt.value, { shouldValidate: true })}
                      className={`rounded-lg border-2 p-4 text-center transition-all hover:border-primary/60 ${
                        selectedPeriod === opt.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border"
                      }`}
                    >
                      <span className="font-display text-lg font-semibold text-foreground">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {errors.period && <p className="text-sm text-destructive">{errors.period.message}</p>}
              </div>

              {/* Special dates */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-accent" />
                  <Label>Eripäevade lilled (valikuline)</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vali päevad, millal soovid lisaks erikimp saada
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {specialDates.map((sd) => (
                    <button
                      key={sd.value}
                      type="button"
                      onClick={() => toggleSpecialDate(sd.value)}
                      className={`rounded-lg border-2 p-3 text-left transition-all hover:border-accent/60 ${
                        selectedSpecialDates.includes(sd.value)
                          ? "border-accent bg-accent/10 shadow-md"
                          : "border-border"
                      }`}
                    >
                      <span className="block font-display font-semibold text-foreground">{sd.label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{sd.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full text-lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saadame...
                  </>
                ) :!isLoggedIn ?(
                  "Pead sisse logima"
                ) :(
                  "Esita tellimus"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
