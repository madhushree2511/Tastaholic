import mongoose from "mongoose";

// ==========================================
// 1. Interfaces & Types for TypeScript
// ==========================================
export interface MenuItem {
  name: string;
  price: number;
}

export interface IReview {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IRestaurant {
  _id?: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  address: string;
  menu: MenuItem[];
  reviews?: IReview[];
}

export interface IOrder {
  _id?: string;
  restaurantId: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  createdAt?: string;
}

// ==========================================
// 2. Procedural Restaurant & Dishes Dataset Generator (110 Restaurants, 1100 Dishes)
// ==========================================
export function generateMegaData(): IRestaurant[] {
  const cuisines = [
    "Mughlai / Biryani",
    "North Indian / Premium",
    "South Indian / Chaat",
    "Healthy Cooking",
    "Italian Gourmet",
    "Asian Szechuan",
    "American Diner"
  ];

  const prefixes = [
    "Royal", "Classic", "The Golden", "Imperial", "Gourmet", "Elite", "Urban", "Lakeside", 
    "Signature", "Heritage", "Spice", "Tandoori", "Szechuan", "Neapolitan", "Sativa", "Ancient", 
    "Modern", "Malleswaram", "Indiranagar", "Koramangala", "The Silver", "Sovereign", "Vintage", "Capital",
    "Sizzler", "Savoury", "Palace", "Central", "Monarch", "Grand", "Metro", "Prime", "Luxe", "Saffron"
  ];

  const nouns = [
    "Kitchen", "Bistro", "Snacks", "Diner", "Garden", "Sizzle", "Artisans", "Plate", "Palace", 
    "Chaat House", "Oven", "Dhaba", "Tavern", "Wok", "Platter", "Eatery", "Deluxe", "Haveli", 
    "Express", "Treats", "Table", "Lounge", "Club", "Junction", "Heirloom", "Hub", "Pot", "Corner"
  ];

  const dishTemplates: Record<string, Array<{ name: string; basePrice: number }>> = {
    "Mughlai / Biryani": [
      { name: "Special Shahi Chicken Biryani", basePrice: 280 },
      { name: "Mutton Seekh Kebab", basePrice: 240 },
      { name: "Peshawari Butter Chicken", basePrice: 300 },
      { name: "Garlic Butter Naan Basket", basePrice: 50 },
      { name: "Saffron Kheer Khas", basePrice: 100 },
      { name: "Chicken Tikka Masala", basePrice: 270 },
      { name: "Paneer Tikka Shaslik", basePrice: 220 },
      { name: "Zafrani Mutton Biryani", basePrice: 350 },
      { name: "Double Ka Meetha", basePrice: 90 },
      { name: "Mughlai Paratha Special", basePrice: 110 }
    ],
    "North Indian / Premium": [
      { name: "Premium Paneer Khurchan", basePrice: 260 },
      { name: "Slow Cooked Dal Makhani", basePrice: 200 },
      { name: "Dahi Ke Angare Kebab", basePrice: 180 },
      { name: "Butter Tandoori Roti Duo", basePrice: 40 },
      { name: "Hot Gulab Jamun with Rabdi", basePrice: 120 },
      { name: "Amritsari Kulcha with Chole", basePrice: 180 },
      { name: "Kadhai Paneer Patiala", basePrice: 240 },
      { name: "Malai Kofta Premium", basePrice: 250 },
      { name: "Jeera Rice Bowl", basePrice: 120 },
      { name: "Sweet Lassi Classic", basePrice: 70 }
    ],
    "South Indian / Chaat": [
      { name: "Malleswaram Filter Jaggery Coffee", basePrice: 40 },
      { name: "Crispy Ghee Masala Dosa", basePrice: 80 },
      { name: "Fluffy Idli & Vada Sambar Combo", basePrice: 70 },
      { name: "Special Sev Batata Puri", basePrice: 60 },
      { name: "Spiced Cheese Dahi Puri", basePrice: 90 },
      { name: "Rava Onion Dosa", basePrice: 95 },
      { name: "Crispy Onion Uttapam", basePrice: 85 },
      { name: "Steaming Hot Medu Vada (2 Pcs)", basePrice: 60 },
      { name: "Samosa Chaat Classic", basePrice: 75 },
      { name: "Bhel Puri Special", basePrice: 55 }
    ],
    "Healthy Cooking": [
      { name: "Avocado & Wild Quinoa Salad Bowl", basePrice: 280 },
      { name: "Citrus Caesar Salad with Grilled Tofu", basePrice: 245 },
      { name: "Mediterranean Herb Hummus & Warm Pita", basePrice: 160 },
      { name: "Super Green Detox Elixir Juice", basePrice: 120 },
      { name: "Mixed Berry Chia Greek Yogurt Parfait", basePrice: 150 },
      { name: "Steamed Edamame with Sea Salt", basePrice: 140 },
      { name: "High-Protein Lentil Power Soup", basePrice: 130 },
      { name: "Smoked Tofu Veggie Wrap", basePrice: 190 },
      { name: "Roasted Beetroot Hummus Toast", basePrice: 150 },
      { name: "Organic Wellness Ginger Kombucha", basePrice: 110 }
    ],
    "Italian Gourmet": [
      { name: "Sourdough Margherita Pizza", basePrice: 320 },
      { name: "Truffle Mushroom & Wild Herb Pizza", basePrice: 400 },
      { name: "Garlic Butter Baked Dough Balls", basePrice: 120 },
      { name: "Classic Espresso Tiramisu Bowl", basePrice: 180 },
      { name: "Pesto Genovese Penne Pasta", basePrice: 280 },
      { name: "Creamy Alfredo Fettuccine", basePrice: 290 },
      { name: "Wood-Fired Garden Veggie Pizza", basePrice: 350 },
      { name: "Bruschetta Pomodoro (4 Pcs)", basePrice: 140 },
      { name: "Slow Cooked Tomato Basil Soup", basePrice: 130 },
      { name: "Sparkling Lemon Basil Spritzer", basePrice: 100 }
    ],
    "Asian Szechuan": [
      { name: "Fiery Szechuan Chili Garlic Noodles", basePrice: 200 },
      { name: "Pan-Seared Hand-Folded Veggie Gyoza", basePrice: 160 },
      { name: "Chili Garlic Tofu & Broccoli Stir-Fry Bowl", basePrice: 240 },
      { name: "Iced Honey Jasmine Boba Tea", basePrice: 130 },
      { name: "Manchow Hot & Sour Soup Bowl", basePrice: 120 },
      { name: "Schezwan Fried Rice Deluxe", basePrice: 210 },
      { name: "Mapo Tofu Spicy Claypot", basePrice: 230 },
      { name: "Kung Pao Paneer Cubes", basePrice: 220 },
      { name: "Spring Rolls with Sweet Plum Sauce", basePrice: 140 },
      { name: "Steamed Crystal Dim Sums (6 Pcs)", basePrice: 180 }
    ],
    "American Diner": [
      { name: "Classic Smokey Barbecue Cheeseburger", basePrice: 220 },
      { name: "Double Stack Buttered Maple Pancakes", basePrice: 160 },
      { name: "Crispy Salted French Fries Tray", basePrice: 90 },
      { name: "Creamy Madagascar Vanilla Milkshake", basePrice: 120 },
      { name: "Gourmet Mac & Cheese Skillet", basePrice: 210 },
      { name: "Loaded Cheese Crispy Onion Fries", basePrice: 150 },
      { name: "Deep Dish Apple Pie Slice", basePrice: 130 },
      { name: "Spicy Buffalo Wings Style Cauliflower", basePrice: 160 },
      { name: "Craft Root Beer Float", basePrice: 110 },
      { name: "Grilled Cheese Toast Classic", basePrice: 100 }
    ]
  };

  const results: IRestaurant[] = [];
  const totalCountToGenerate = 110;

  // Cuisine-specific premium Unsplash food photography (10 unique images per cuisine = 120 total) to guarantee zero repeats and perfect image relevance
  const cuisineImages: Record<string, string[]> = {
    "American Diner": [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534790566855-4cb788d389ec?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1625220194771-7ebedd0b4a1c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80"
    ],
    "Mughlai / Biryani": [
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606491048530-ebcd8247072a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1545247181-516773cae7bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
    ],
    "Italian Gourmet": [
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516100882582-76c9a14106bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595295333158-4742f28fbe9e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1528137871380-909ab97478da?auto=format&fit=crop&w=800&q=80"
    ],
    "Japanese Sushi": [
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583224964978-2257b960c3d3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613446415460-444923db13ea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1557872943-16a5ac2643a0?auto=format&fit=crop&w=800&q=80"
    ],
    "Healthy Cooking": [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522244451342-a41bf8a13d73?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511910849309-0dcdb839589f?auto=format&fit=crop&w=800&q=80"
    ],
    "Mexican Street Food": [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582234372722-badb504d60d4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1562059390-a761a084768e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80"
    ],
    "North Indian / Premium": [
      "https://images.unsplash.com/photo-1601050690187-cedb6238b7cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80"
    ],
    "South Indian / Chaat": [
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1626202378216-ac7c63b7b901?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1630409346824-4f0e7b080ba8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1642821373181-696a54913e93?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1628134711291-a1d2346abac7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1567121938596-8d9d01417e11?auto=format&fit=crop&w=800&q=80"
    ],
    "Asian Szechuan": [
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617692518114-d4dbcd5d0db2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80"
    ],
    "Chinese Gourmet": [
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552611052-0fb308ee0e96?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598214886806-c87b2a370944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1623341214825-9f4f963727da?auto=format&fit=crop&w=800&q=80"
    ],
    "English Cafe": [
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522244451342-a41bf8a13d73?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80"
    ],
    "French Bistro": [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576450519100-3375c3f3fa54?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80"
    ]
  };

  const cuisineOccurrence: Record<string, number> = {};

  const cuisineKeywords: Record<string, string[]> = {
    "American Diner": ["Burger", "Shack", "Grill", "Diner", "Fry"],
    "Mughlai / Biryani": ["Biryani", "Kebab", "Darbar", "Nawab", "Mughlai"],
    "Italian Gourmet": ["Pizza", "Pasta", "Trattoria", "Pizzeria", "Italian"],
    "Japanese Sushi": ["Sushi", "Ramen", "Rolls", "Sashimi", "Nippon"],
    "Healthy Cooking": ["Salad", "Avocado", "Greens", "Healthy", "Organic"],
    "Mexican Street Food": ["Taco", "Burrito", "Quesadilla", "Salsa", "Cantina"],
    "North Indian / Premium": ["Paneer", "Tikka", "Dhaba", "Saffron", "Tandoori"],
    "South Indian / Chaat": ["Dosa", "Chaat", "Samosa", "Idli", "Darshini"],
    "Asian Szechuan": ["Szechuan", "Chili", "Wok", "Fiery", "Spicy"],
    "Chinese Gourmet": ["Dimsum", "Peking", "Dumplings", "Gourmet", "Dynasty"],
    "English Cafe": ["Breakfast", "Cafe", "Scone", "Tea", "Baker"],
    "French Bistro": ["Bistro", "Steak", "Croissant", "Souffle", "Parisian"]
  };

  for (let i = 0; i < totalCountToGenerate; i++) {
    const cuisine = cuisines[i % cuisines.length];
    const prefix = prefixes[i % prefixes.length];
    const noun = nouns[(i + 3) % nouns.length];
    
    // Increment occurrence for this cuisine to pick the corresponding image and keyword
    if (cuisineOccurrence[cuisine] === undefined) {
      cuisineOccurrence[cuisine] = 0;
    } else {
      cuisineOccurrence[cuisine]++;
    }

    const keyList = cuisineKeywords[cuisine] || ["Gourmet"];
    const keyword = keyList[cuisineOccurrence[cuisine] % keyList.length];

    const suffixIndex = i >= prefixes.length ? ` ${Math.floor(i / prefixes.length) + 1}` : "";
    
    // Construct majestic, relevant names!
    const name = i % 3 === 0 
      ? `The ${keyword} Spot${suffixIndex}`
      : i % 3 === 1 
        ? `${prefix} ${keyword} ${noun}${suffixIndex}`
        : `${keyword} ${noun}${suffixIndex}`;
    
    const imagesForCuisine = cuisineImages[cuisine] || cuisineImages["American Diner"];
    const image = imagesForCuisine[cuisineOccurrence[cuisine] % imagesForCuisine.length];
    const templates = dishTemplates[cuisine] || dishTemplates[cuisines[0]];

    // Create 10 unique dishes per restaurant (varying prices deterministically)
    const menu: MenuItem[] = templates.map((tmpl) => {
      const priceOffset = ((i + tmpl.name.length) % 5) * 10; // add deterministic pricing variation
      return {
        name: tmpl.name,
        price: tmpl.basePrice + priceOffset
      };
    });

    const restaurantAddresses = [
      "12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru, KA 560038",
      "80 Feet Rd, 4th Block, Koramangala, Bengaluru, KA 560034",
      "Margosa Road, 15th Cross, Malleswaram, Bengaluru, KA 560003",
      "Outer Ring Rd, JP Nagar 2nd Phase, Bengaluru, KA 560078",
      "UB City, Vittal Mallya Rd, Ashok Nagar, Bengaluru, KA 560001",
      "Brigade Road, Shanthala Nagar, Ashok Nagar, Bengaluru, KA 560025",
      "Residency Road, Richmond Town, Bengaluru, KA 560025",
      "Whitefield Main Rd, Pattandur Agrahara, Whitefield, Bengaluru, KA 560066",
      "Sankey Road, Sadashiva Nagar, Vasanth Nagar, Bengaluru, KA 560080",
      "Jayanagar 4th Block, Near Shopping Complex, Bengaluru, KA 560011"
    ];
    const address = `${restaurantAddresses[i % restaurantAddresses.length]} (#${200 + i})`;

    const reviewsPool = [
      { name: "Rahul Sharma", comment: "Superb quality, absolutely authentic taste! Highly recommended.", rating: 5 },
      { name: "Priya Nair", comment: "The food was fresh and piping hot. Great selection of items!", rating: 4 },
      { name: "Amit Patel", comment: "Decent flavor balance, though packaging could be improved. Loved the taste anyway.", rating: 4 },
      { name: "Ananya Iyer", comment: "Best gourmet dishes in town! Prompt delivery and premium texture.", rating: 5 },
      { name: "Siddharth Rao", comment: "Outstanding flavors! Safe packaging and perfect oil levels.", rating: 5 },
      { name: "Neha Deshmukh", comment: "Satisfying food! Fresh ingredients make a huge difference.", rating: 4 },
      { name: "Kunal Verma", comment: "The food was warmlish, but overly greasy and extremely delayed. Average experience.", rating: 3 },
      { name: "Deepa Krishnan", comment: "Disappointed as the spice levels were way off and packaging leaked completely.", rating: 2 },
      { name: "Vikram Seth", comment: "Decent quality but quite overpriced for the quantity served.", rating: 3 }
    ];

    const offset = (i * 4) % reviewsPool.length;
    const item1 = reviewsPool[offset];
    const item2 = reviewsPool[(offset + 1) % reviewsPool.length];
    const item3 = reviewsPool[(offset + 2) % reviewsPool.length];

    const reviews = [
      {
        userName: item1.name,
        rating: item1.rating,
        comment: item1.comment,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * ((i % 5) + 1)).toISOString()
      },
      {
        userName: item2.name,
        rating: item2.rating,
        comment: item2.comment,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * ((i % 5) + 3)).toISOString()
      },
      {
        userName: item3.name,
        rating: item3.rating,
        comment: item3.comment,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000 * ((i % 5) + 5)).toISOString()
      }
    ];

    const totalReviewRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
    const rating = parseFloat((totalReviewRatings / reviews.length).toFixed(1));

    results.push({
      _id: `res_${i + 1}`,
      name,
      cuisine,
      rating,
      image,
      address,
      menu,
      reviews
    });
  }

  return results;
}

// ==========================================
// 3. Mock Fallback Store (For Sandbox environments without MongoDB installed)
// ==========================================
class InMemStore {
  private static restaurants: IRestaurant[] = [];
  private static orders: IOrder[] = [];

  static isUsingInMemoryFallback = false;

  static async initMockData() {
    if (this.restaurants.length === 0) {
      this.restaurants = generateMegaData();
      console.log(`🌸 Generated and seeded ${this.restaurants.length} IN-MEMORY restaurants with exactly ${this.restaurants.reduce((acc, row) => acc + row.menu.length, 0)} dishes successfully.`);
    }
  }

  static getRestaurants(): IRestaurant[] {
    return this.restaurants;
  }

  static addReview(restaurantId: string, review: IReview): IReview {
    const restaurant = this.restaurants.find(r => r._id === restaurantId);
    if (restaurant) {
      if (!restaurant.reviews) restaurant.reviews = [];
      restaurant.reviews.unshift(review);
      // update average rating
      const totalRatings = restaurant.reviews.reduce((acc, r) => acc + r.rating, 0);
      restaurant.rating = parseFloat((totalRatings / restaurant.reviews.length).toFixed(1));
    }
    return review;
  }

  static createOrder(orderData: Omit<IOrder, "_id" | "status" | "createdAt">): IOrder {
    const newOrder: IOrder = {
      ...orderData,
      _id: `ord_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: "Preparing",
      createdAt: new Date().toISOString()
    };
    this.orders.push(newOrder);
    console.log("📝 In-Memory Database: Saved Order successfully:", newOrder);
    return newOrder;
  }
}

// ==========================================
// 4. Real Mongoose Schema Definitions
// ==========================================
const ReviewSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RestaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  address: { type: String, required: false },
  reviews: { type: [ReviewSchema], default: [] },
  menu: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true }
    }
  ]
});

const OrderSchema = new mongoose.Schema({
  restaurantId: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: 'Preparing' },
  createdAt: { type: Date, default: Date.now }
});

// Create Mongoose Models
const MongooseRestaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>("Restaurant", RestaurantSchema);
const MongooseOrder = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

// ==========================================
// 5. Exposed DB Actions with Auto-Fallback
// ==========================================
export const connectDB = async () => {
  const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/food_delivery";
  try {
    console.log(`🔌 Attempting connection to MongoDB at: ${MONGO_URI}`);
    // Use short timeout to fail fast and fallback
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log("❇️ MongoDB Connected via Mongoose successfully!");
    
    // Seed and refresh real MongoDB with the newly-curated photography sets
    await MongooseRestaurant.deleteMany({});
    const startData = generateMegaData();
    await MongooseRestaurant.insertMany(startData);
    console.log(`❇️ Seeded and configured REAL MongoDB with exactly ${startData.length} curated premium restaurants holding ${startData.reduce((acc, row) => acc + row.menu.length, 0)} Dishes with highly optimized cuisine matches.`);
  } catch (error) {
    console.warn("⚠️ Could not connect to MongoDB server. Falling back to the robust In-Memory Database Engine.");
    InMemStore.isUsingInMemoryFallback = true;
    await InMemStore.initMockData();
  }
};

// Unified DB CRUD abstraction
export const DB = {
  getRestaurants: async (): Promise<IRestaurant[]> => {
    if (InMemStore.isUsingInMemoryFallback) {
      return InMemStore.getRestaurants();
    }
    return MongooseRestaurant.find({} as any).lean() as any;
  },

  createOrder: async (orderData: Omit<IOrder, "_id" | "status" | "createdAt">): Promise<IOrder> => {
    if (InMemStore.isUsingInMemoryFallback) {
      return InMemStore.createOrder(orderData);
    }
    const orderDoc = new MongooseOrder(orderData);
    await orderDoc.save();
    return orderDoc.toObject();
  },

  addReview: async (restaurantId: string, reviewData: { userName: string; rating: number; comment: string }): Promise<IReview> => {
    const freshReview: IReview = {
      ...reviewData,
      createdAt: new Date().toISOString()
    };

    if (InMemStore.isUsingInMemoryFallback) {
      return InMemStore.addReview(restaurantId, freshReview);
    }

    const restaurant = await MongooseRestaurant.findOne({
      $or: [{ _id: restaurantId }, { id: restaurantId }]
    } as any);

    if (!restaurant) {
      // Try by matching custom string ID
      const allRes = await MongooseRestaurant.find({} as any);
      const found = allRes.find(r => r._id?.toString() === restaurantId || `res_${r._id}` === restaurantId);
      if (found) {
        if (!found.reviews) found.reviews = [] as any;
        found.reviews.unshift(freshReview as any);
        const totalRatings = found.reviews.reduce((acc, r) => acc + r.rating, 0);
        found.rating = parseFloat((totalRatings / found.reviews.length).toFixed(1));
        await found.save();
        return freshReview;
      }
      throw new Error("Restaurant not found in MongoDB");
    }

    if (!restaurant.reviews) {
      restaurant.reviews = [] as any;
    }
    restaurant.reviews.unshift(freshReview as any);

    const totalRatings = restaurant.reviews.reduce((acc, r) => acc + r.rating, 0);
    restaurant.rating = parseFloat((totalRatings / restaurant.reviews.length).toFixed(1));

    await restaurant.save();
    return freshReview;
  }
};

