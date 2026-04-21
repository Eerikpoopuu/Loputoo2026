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
}
export interface Subscription {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  delivery_address: string;
  bouquet: "small" | "medium" | "large";
  period: "weekly" | "monthly";
  next_delivery_date?: string;
  user_id?: string;
}
export async function fetchSubscriptions(token: string): Promise<Subscription[]> {
  const response = await fetch(`${API_BASE_URL}/api/subscriptions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Tellimuste laadimine ebaõnnestus");
  }
  const data = await response.json();
  return data.subscriptions;
}

export async function cancelSubscription(subscriptionId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/subscriptions/${subscriptionId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Tellimuse tühistamine ebaõnnestus");
  }
  return response.json();
}

export async function submitSubscription(data: SubscriptionOrderData) {
  const response = await fetch(`${API_BASE_URL}/api/subscribe/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

export async function createStripeCheckout(priceId: string, orderData: SubscriptionOrderData, token: string) {
  const response = await fetch(`${API_BASE_URL}/api/stripe-checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ priceId, ...orderData }),
  });

  const data = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(data?.error || "Stripe Checkout URL puudub");
  }

  return data.url;
}
