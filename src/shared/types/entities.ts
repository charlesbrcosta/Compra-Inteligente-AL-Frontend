export type FuelType = 'gasolina' | 'etanol' | 'diesel' | 'gnv';
export type MarketType = 'supermercado' | 'atacadista';
export type UnitType = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'pct' | 'cx';
export type RouteConditionType = 'accident' | 'rain' | 'road_block' | 'traffic' | 'road_work';
export type RouteConditionSeverity = 'low' | 'medium' | 'high';
export type DistanceSource = 'openrouteservice' | 'osrm' | 'local_estimate';

export interface User {
  id: string;
  name: string;
  email: string;
  city: string;
  neighborhood: string;
}

export interface Vehicle {
  id: string;
  model: string;
  fuelType: FuelType;
  averageConsumptionKmPerLiter: number;
  fuelPricePerLiter: number;
}

export interface ShoppingProduct {
  id: string;
  name: string;
  quantity: number;
  unit: UnitType;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export interface RouteCondition {
  type: RouteConditionType;
  label: string;
  severity: RouteConditionSeverity;
  impactPercent: number;
  description: string;
}

export interface MarketProductPrice {
  productName: string;
  unit: UnitType;
  price: number;
}

export interface Market {
  id: string;
  name: string;
  type: MarketType;
  address: string;
  city: string;
  neighborhood: string;
  distanceKm: number;
  distanceSource?: DistanceSource;
  location: GeoLocation;
  routeConditions?: RouteCondition[];
  products: MarketProductPrice[];
}

export interface Recommendation {
  market: Market;
  productsTotal: number;
  baseDisplacementCost: number;
  routeImpactCost: number;
  routeImpactPercent: number;
  routeConditions: RouteCondition[];
  displacementCost: number;
  finalTotal: number;
  estimatedSavings: number;
  missingProducts: ShoppingProduct[];
  isBest: boolean;
}

export interface RecommendationHistory {
  id: string;
  userId: string;
  createdAt: string;
  recommendations: Recommendation[];
}

export interface SefazProductPrice {
  productName: string;
  sefazDescription?: string;
  unit: string;
  price: number;
  saleDate: string;
  gtin?: string;
  marketName: string;
  corporateName: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface SefazFuelPrice {
  fuelType: FuelType;
  productName: string;
  unit: string;
  price: number;
  saleDate: string;
  stationName: string;
  corporateName: string;
  cnpj: string;
  address: string;
  neighborhood: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface SefazFuelSummary {
  source: 'sefaz';
  fuelType: FuelType;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  samples: number;
  cityIbgeCode: number;
  prices: SefazFuelPrice[];
}
