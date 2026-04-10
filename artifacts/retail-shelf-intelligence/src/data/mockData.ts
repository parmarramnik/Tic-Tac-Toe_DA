export type StockLevel = "full" | "low" | "empty";

export interface ShelfSlot {
  id: string;
  row: number;
  col: number;
  sku: string;
  name: string;
  stock: StockLevel;
  quantity: number;
  maxQuantity: number;
  price: number;
  compliant: boolean;
  lastUpdated: string;
}

export interface Aisle {
  id: string;
  name: string;
  complianceScore: number;
  slots: ShelfSlot[];
}

export interface Alert {
  id: string;
  type: "stockout" | "low_stock" | "planogram" | "price_error";
  sku: string;
  product: string;
  aisle: string;
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  revenueImpact: number;
}

export interface ForecastPoint {
  date: string;
  demand: number;
  forecast: number;
  lowerBound: number;
  upperBound: number;
}

export interface SKUMetric {
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  reorderPoint: number;
  weeklyDemand: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

const PRODUCTS = [
  { sku: "SKU-001", name: "Organic Whole Milk 1L", price: 3.99 },
  { sku: "SKU-002", name: "Greek Yogurt 500g", price: 2.49 },
  { sku: "SKU-003", name: "Free Range Eggs 12pk", price: 4.99 },
  { sku: "SKU-004", name: "Sourdough Bread", price: 3.29 },
  { sku: "SKU-005", name: "Cheddar Cheese 200g", price: 2.99 },
  { sku: "SKU-006", name: "Butter 250g", price: 2.79 },
  { sku: "SKU-007", name: "Orange Juice 1L", price: 2.99 },
  { sku: "SKU-008", name: "Chicken Breast 500g", price: 5.49 },
  { sku: "SKU-009", name: "Pasta Penne 500g", price: 1.29 },
  { sku: "SKU-010", name: "Tomato Sauce 400g", price: 1.79 },
  { sku: "SKU-011", name: "Olive Oil 500ml", price: 6.99 },
  { sku: "SKU-012", name: "Sparkling Water 6pk", price: 4.49 },
];

function randomStock(): StockLevel {
  const r = Math.random();
  if (r < 0.15) return "empty";
  if (r < 0.35) return "low";
  return "full";
}

function stockQuantity(level: StockLevel, max: number): number {
  if (level === "empty") return 0;
  if (level === "low") return Math.floor(max * 0.2);
  return Math.floor(max * (0.7 + Math.random() * 0.3));
}

function generateAisle(id: string, name: string, rows: number, cols: number): Aisle {
  const slots: ShelfSlot[] = [];
  let compliance = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const product = PRODUCTS[(row * cols + col) % PRODUCTS.length];
      const stock = randomStock();
      const max = 20 + Math.floor(Math.random() * 20);
      const isCompliant = Math.random() > 0.15;
      if (isCompliant) compliance++;
      slots.push({
        id: `${id}-r${row}-c${col}`,
        row,
        col,
        sku: product.sku,
        name: product.name,
        stock,
        quantity: stockQuantity(stock, max),
        maxQuantity: max,
        price: product.price,
        compliant: isCompliant,
        lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      });
    }
  }
  return {
    id,
    name,
    complianceScore: Math.round((compliance / slots.length) * 100),
    slots,
  };
}

export const aisles: Aisle[] = [
  generateAisle("A1", "Aisle A – Dairy", 3, 8),
  generateAisle("A2", "Aisle B – Bread & Bakery", 3, 8),
  generateAisle("A3", "Aisle C – Beverages", 3, 8),
  generateAisle("A4", "Aisle D – Meat & Poultry", 3, 8),
  generateAisle("A5", "Aisle E – Dry Goods", 3, 8),
];

export const alerts: Alert[] = [
  {
    id: "ALT-001",
    type: "stockout",
    sku: "SKU-001",
    product: "Organic Whole Milk 1L",
    aisle: "Aisle A – Dairy",
    severity: "critical",
    message: "Complete stockout detected. Shelf empty for 23 minutes.",
    timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    revenueImpact: 142.4,
  },
  {
    id: "ALT-002",
    type: "low_stock",
    sku: "SKU-003",
    product: "Free Range Eggs 12pk",
    aisle: "Aisle A – Dairy",
    severity: "warning",
    message: "Stock below reorder point. 4 units remaining.",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    revenueImpact: 89.6,
  },
  {
    id: "ALT-003",
    type: "planogram",
    sku: "SKU-004",
    product: "Sourdough Bread",
    aisle: "Aisle B – Bread & Bakery",
    severity: "warning",
    message: "Product misplaced. Should be shelf 2, column 3.",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    revenueImpact: 34.5,
  },
  {
    id: "ALT-004",
    type: "price_error",
    sku: "SKU-011",
    product: "Olive Oil 500ml",
    aisle: "Aisle E – Dry Goods",
    severity: "critical",
    message: "Price tag mismatch detected. Tag shows $5.99, system shows $6.99.",
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    revenueImpact: 0,
  },
  {
    id: "ALT-005",
    type: "stockout",
    sku: "SKU-007",
    product: "Orange Juice 1L",
    aisle: "Aisle C – Beverages",
    severity: "critical",
    message: "Complete stockout. High demand product.",
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    revenueImpact: 211.5,
  },
];

function generateForecast(days: number, baseDemand: number): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  for (let i = -7; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    const noise = 0.85 + Math.random() * 0.3;
    const demand = i < 0 ? Math.round(baseDemand * weekendBoost * noise) : 0;
    const forecast = Math.round(baseDemand * weekendBoost * (0.95 + Math.random() * 0.1));
    points.push({
      date: date.toISOString().split("T")[0],
      demand,
      forecast,
      lowerBound: Math.round(forecast * 0.85),
      upperBound: Math.round(forecast * 1.15),
    });
  }
  return points;
}

export const forecastData = generateForecast(7, 48);

export const skuMetrics: SKUMetric[] = PRODUCTS.map((p, i) => ({
  sku: p.sku,
  name: p.name,
  category: i < 3 ? "Dairy" : i < 6 ? "Bakery" : i < 9 ? "Beverages" : "Dry Goods",
  currentStock: Math.floor(Math.random() * 80) + 5,
  reorderPoint: 20,
  weeklyDemand: Math.floor(Math.random() * 150) + 30,
  revenue: Math.round(p.price * (Math.floor(Math.random() * 150) + 30) * 100) / 100,
  trend: Math.random() > 0.6 ? "up" : Math.random() > 0.5 ? "down" : "stable",
}));

export const dashboardStats = {
  totalProducts: 1247,
  inStockCount: 1089,
  lowStockCount: 98,
  outOfStockCount: 60,
  overallComplianceScore: 87,
  activeAlerts: alerts.length,
  estimatedRevenueLost: alerts.reduce((s, a) => s + a.revenueImpact, 0),
  avgReplenishmentTime: 18,
};
