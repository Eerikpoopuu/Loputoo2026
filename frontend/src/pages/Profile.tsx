import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/components/ui/table";
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,} from "@/components/ui/alert-dialog";
import { fetchSubscriptions, cancelSubscription, type Subscription } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Loader2, X, Package, User, Mail } from "lucide-react";

const bouquetLabels: Record<string, string> = {
  small: "Väike kimp",
  medium: "Keskmine kimp",
  large: "Suur kimp",
};

const periodLabels: Record<string, string> = {
  weekly: "Iganädalane",
  monthly: "Igakuine",
};

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }
    loadSubscriptions();
  }, [isLoggedIn, navigate]);

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

  const handleCancelClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    const token = localStorage.getItem("token");
    if (!selectedOrderId || !token) return;
    setCancellingId(selectedOrderId);
    setConfirmOpen(false);
    try {
      await cancelSubscription(selectedOrderId, token);
      setOrders((prev) => prev.filter((o) => o.id !== selectedOrderId));
      toast({ title: "Tellimus tühistatud", description: "Tellimus on edukalt tühistatud." });
    } catch {
      toast({ title: "Viga", description: "Tellimuse tühistamine ebaõnnestus.", variant: "destructive" });
    } finally {
      setCancellingId(null);
      setSelectedOrderId(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-14">
        <main className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
          {/* User info card */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Kasutaja andmed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Minu tellimused</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : orders.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Tellimusi ei leitud.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kimp</TableHead>
                        <TableHead>Periood</TableHead>
                        <TableHead>Tarneaadress</TableHead>
                        <TableHead className="text-right">Tegevus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {bouquetLabels[order.bouquet] || order.bouquet}
                          </TableCell>
                          <TableCell>{periodLabels[order.period] || order.period}</TableCell>
                          <TableCell>{order.delivery_address}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:bg-destructive/10"
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelClick(order.id)}
                            >
                              {cancellingId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
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

      {/* Cancel confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kas oled kindel?</AlertDialogTitle>
            <AlertDialogDescription>
              Kas oled kindel, et soovid selle tellimuse tühistada? Seda tegevust ei saa tagasi võtta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ei, tühista</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Jah, tühista tellimus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
