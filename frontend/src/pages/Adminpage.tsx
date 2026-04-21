import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchSubscriptions, type Subscription } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Package } from "lucide-react";

const bouquetLabels: Record<string, string> = {
  small: "Väike kimp",
  medium: "Keskmine kimp",
  large: "Suur kimp",
};

const periodLabels: Record<string, string> = {
  weekly: "Iganädalane",
  monthly: "Igakuine",
};

export default function Adminpage() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }
    loadSubscriptions();
  }, [isLoggedIn, user, navigate]);

  const loadSubscriptions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchSubscriptions(token);
      setOrders(data);
    } catch {
      toast({ title: "Viga", description: "Tellimuste laadimine ebaõnnestus.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = filterDate
    ? orders.filter((o) => o.next_delivery_date?.startsWith(filterDate))
    : orders;

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-14">
        <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Kõik tellimused</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 max-w-xs">
                <Label htmlFor="filterDate">Filtreeri tarnekuupäeva järgi</Label>
                <Input
                  id="filterDate"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-44"
                />
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">Tellimusi ei leitud.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Eesnimi</TableHead>
                        <TableHead>Perekonnanimi</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Tarneaadress</TableHead>
                        <TableHead>Kimp</TableHead>
                        <TableHead>Periood</TableHead>
                        <TableHead>Järgmine tarne</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.first_name}</TableCell>
                          <TableCell>{order.last_name}</TableCell>
                          <TableCell>{order.phone}</TableCell>
                          <TableCell>{order.delivery_address}</TableCell>
                          <TableCell>{bouquetLabels[order.bouquet] || order.bouquet}</TableCell>
                          <TableCell>{periodLabels[order.period] || order.period}</TableCell>
                          <TableCell>
                            {order.next_delivery_date
                              ? new Date(order.next_delivery_date).toLocaleDateString("et-EE")
                              : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
