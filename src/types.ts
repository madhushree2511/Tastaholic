export interface MenuItem {
  name: string;
  price: number;
}

export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  address: string;
  menu: MenuItem[];
  reviews?: any[];
}

export interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  restaurantId: string;
  items: CartItem[];
  totalAmount: number;
}

export function getDeliveryTime(restaurantName: string): string {
  if (!restaurantName) return "25 - 30 MINS";
  let hash = 0;
  for (let i = 0; i < restaurantName.length; i++) {
    hash = restaurantName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const minutesOptions = [
    "15 - 20 MINS",
    "20 - 25 MINS",
    "25 - 30 MINS",
    "30 - 35 MINS",
    "35 - 40 MINS",
    "40 - 45 MINS"
  ];
  const idx = Math.abs(hash) % minutesOptions.length;
  return minutesOptions[idx];
}

export function getDeliveryEta(restaurantName: string): string {
  const time = getDeliveryTime(restaurantName);
  // Match "15 - 20 MINS" -> "15-20 Mins"
  return time.replace(/\s+/g, "").replace("MINS", " Mins");
}

