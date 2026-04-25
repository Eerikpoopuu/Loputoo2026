import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flower, Flower2, UserCheck, Package, Truck } from "lucide-react";
import SubscriptionForm from "@/components/SubscriptionForm";
import { Header } from "@/components/Header";
import { toast } from "@/hooks/use-toast";
import heroBg from "@/assets/hero-bg.jpg";
import bouquetSmall from "@/assets/bouquet-small.jpg";
import bouquetMedium from "@/assets/bouquet-medium.jpg";
import bouquetLarge from "@/assets/bouquet-large.jpg";

const bouquets = [
  {
    title: "Väike kimp",
    price: "19,90 €",
    description: "Armas kompaktne kimp värskete hooajaliste lilledega, ideaalne lauale.",
    image: bouquetSmall,
    value: "small",
  },
  {
    title: "Keskmine kimp",
    price: "29,90 €",
    description: "Rikkalik segu roosidest, liiliatest ja lavendlist – toob rõõmu igasse tuppa.",
    image: bouquetMedium,
    value: "medium",
  },
  {
    title: "Suur kimp",
    price: "44,90 €",
    description: "Luksuslik suurejooneline kimbuseade orhideedega ja eksootiliste lilledega.",
    image: bouquetLarge,
    value: "large",
  },
];

export default function Index() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBouquet, setSelectedBouquet] = useState<"small" | "medium" | "large" | undefined>();

  const handleSelectBouquet = (value: "small" | "medium" | "large") => {
    setSelectedBouquet(value);
    document.getElementById("tellimus")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      toast({
        title: "Tellimus edukalt esitatud!",
        description: "Makse õnnestus ja tellimus on salvestatud.",
      });
      setSearchParams({});
    } else if (payment === "cancelled") {
      toast({
        title: "Makse katkestatud",
        description: "Tagasid makselt. Tellimust ei salvestatud.",
        variant: "destructive",
      });
      setSearchParams({});
    } else if (payment === "error") {
      toast({
        title: "Viga",
        description: "Maksega tekkis probleem. Palun võta meiega ühendust.",
        variant: "destructive",
      });
      setSearchParams({});
    }
  }, []);

  const scrollToForm = () => {
    document.getElementById("tellimus")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        

          <div className="flex items-center gap-2">
            <Header />
          
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-14">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center">
          <Flower2 className="mx-auto mb-6 h-12 w-12 text-primary animate-float" />
          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Värsked lilled<br />iga nädal
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-8">
            Telli endale või lähedastele imelised lillekimbud otse koju. Meie floristid valivad iga kimbu käsitsi, armastusega.
          </p>
          <Button size="lg" onClick={scrollToForm} className="text-lg px-8 py-6 shadow-lg">
            <Flower className="mr-2 h-5 w-5" />
            Telli kohe
          </Button>
        </div>
      </header>

      {/* Bouquet Cards Section */}
      <main>
        <section className="py-10 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl font-bold text-foreground mb-3">Meie kimbud</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {bouquets.map((b) => (
                <Card
                  key={b.value}
                  className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card/80 backdrop-blur-sm"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-6 text-center">
                    <h3 className="font-display text-2xl font-semibold text-foreground mb-1">{b.title}</h3>
                    <p className="text-primary font-bold text-xl mb-3">{b.price}</p>
                    <p className="text-muted-foreground text-sm mb-4">{b.description}</p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleSelectBouquet(b.value as "small" | "medium" | "large")}
                    >
                      Vali
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 px-4 bg-secondary/40">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-10">Kuidas see toimib?</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <UserCheck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">1. Registreeru</h3>
                <p className="text-muted-foreground text-sm">Loo konto e-mailiga või Google kontoga. Kiire ja lihtne.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">2. Vali kimp</h3>
                <p className="text-muted-foreground text-sm">Vali sobiv suurus ja tarnekuupäev. Iganädalane või igakuine.</p>
              </div>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">3. Naudi</h3>
                <p className="text-muted-foreground text-sm">Värsked lilled toimetatakse automaatselt otse sinu uksele.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Form */}
        <SubscriptionForm preselectedBouquet={selectedBouquet} />
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-border">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lillede Tellimusteenus. Kõik õigused kaitstud.
        </p>
      </footer>
    </div>
  );
}
