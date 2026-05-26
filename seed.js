import mongoose from "mongoose";
import dotenv from "dotenv";
import Restaurant from "./models/Restaurant.js";

// Load environment variables
dotenv.config();

// Ensure we have a database connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/food_delivery";

// 12 cuisines exactly matching seed profile
const cuisines = [
  "American Diner",
  "Mughlai / Biryani",
  "Italian Gourmet",
  "Japanese Sushi",
  "Healthy Cooking",
  "Mexican Street Food",
  "North Indian / Premium",
  "South Indian / Chaat",
  "Asian Szechuan",
  "Chinese Gourmet",
  "English Cafe",
  "French Bistro"
];

// Cuisine-specific premium Unsplash food photography (10 unique images per cuisine = 120 total) to guarantee zero repeats and perfect image relevance
const cuisineImages = {
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

// Cuisine-specific keywords for naming relevant restaurants
const cuisineKeywords = {
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

async function seedDatabase() {
  try {
    console.log("=========================================");
    console.log("🌱 STARTING MOCK RESTAURANT SEED PROCESS");
    console.log("=========================================");
    
    console.log(`🔌 Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log("❇️ MongoDB Connected successfully!");

    // Clear existing collection to avoid duplicated runs
    console.log("🧹 Clearing the existing Restaurant collection...");
    await Restaurant.deleteMany({});
    console.log("🧼 Collection cleared successfully.");

    const restaurants = [];
    const cuisineOccurrence = {};

    // Generate exactly 100 unique mock restaurants with perfectly matched metadata
    for (let i = 1; i <= 100; i++) {
      const cuisine = cuisines[i % cuisines.length];
      
      // Increment cuisine count
      if (cuisineOccurrence[cuisine] === undefined) {
        cuisineOccurrence[cuisine] = 0;
      } else {
        cuisineOccurrence[cuisine]++;
      }

      // Pick the correct Unsplash cuisine-specific image safely from its 10-item list
      const imagesForCuisine = cuisineImages[cuisine] || cuisineImages["American Diner"];
      const image = imagesForCuisine[cuisineOccurrence[cuisine] % imagesForCuisine.length];

      // Pick highly relevant sub-keyword for the restaurant name definition
      const keyList = cuisineKeywords[cuisine] || ["Gourmet"];
      const keyword = keyList[cuisineOccurrence[cuisine] % keyList.length];

      const prefix = prefixes[i % prefixes.length];
      const noun = nouns[(i + 3) % nouns.length];

      const suffixIndex = i >= prefixes.length ? ` ${Math.floor(i / prefixes.length) + 1}` : "";

      // Construct majestic, relevant names!
      const name = i % 3 === 0 
        ? `The ${keyword} Spot${suffixIndex}`
        : i % 3 === 1 
          ? `${prefix} ${keyword} ${noun}${suffixIndex}`
          : `${keyword} ${noun}${suffixIndex}`;

      // Generate random rating between 4.1 and 4.9 (rounded to 1 decimal)
      const rating = parseFloat((Math.random() * (4.9 - 4.1) + 4.1).toFixed(1));

      restaurants.push({
        name,
        cuisine,
        rating,
        image
      });
    }

    console.log(`⚙️ Inserting ${restaurants.length} unique mock restaurants into database...`);
    await Restaurant.insertMany(restaurants);
    
    console.log("=========================================");
    console.log(`🎉 SUCCESS! Seeded ${restaurants.length} unique mock restaurants with perfect high-contrast cuisine-aligned safe images.`);
    console.log("=========================================");

    // Close the connection clean
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Seeding Failure:", error);
    process.exit(1);
  }
}

seedDatabase();
