import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Flower, Flower2, Leaf } from "lucide-react";
import SubscriptionForm from "@/components/SubscriptionForm";
import { Header } from "@/components/Header";
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
        <div className="relative container mx-auto px-4 py-28 md:py-40 text-center">
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
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl font-bold text-foreground mb-3">Meie kimbud</h2>
              <p className="text-muted-foreground text-lg">Vali endale sobiv suurus</p>
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
                    <p className="text-muted-foreground text-sm">{b.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Period info */}
        <section className="py-16 px-4 bg-secondary/40">
          <div className="container mx-auto max-w-3xl text-center">
            <Leaf className="mx-auto mb-4 h-8 w-8 text-accent" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-6">Kuidas see toimib?</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-card p-6 shadow-md">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Iganädalane tellimus</h3>
                <p className="text-muted-foreground">
                  Iga nädal uus kimp värskeid lilli otse sinu uksele. Ideaalne neile, kes armastavad pidevat ilu.
                </p>
              </div>
              <div className="rounded-xl bg-card p-6 shadow-md">
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">Igakuine tellimus</h3>
                <p className="text-muted-foreground">
                  Kord kuus eriline hooajaline kimp, mis kestab kaua ja toob rõõmu kogu kuuks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Form */}
        <SubscriptionForm />
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
