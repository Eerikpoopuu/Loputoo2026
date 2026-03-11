import { useAuth } from "@/hooks/use-auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface SubscriptionOrderData {
  first_name: string;
  last_name: string;
  phone: string;
  delivery_address: string;
  bouquet: "small" | "medium" | "large";
  period: "weekly" | "monthly";
  special_dates?: string[];
  user_id:string;
}

export async function submitSubscription(data: SubscriptionOrderData, token:string) {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail || `Viga tellimisel (${response.status})`
    );
  }

  return response.json();
}
