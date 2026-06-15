export type FuelType = 'gasolina' | 'etanol' | 'diesel' | 'gnv';
export type MarketType = 'supermercado' | 'atacadista';
export type UnitType = 'un' | 'kg' | 'g' | 'l' | 'ml' | 'pct' | 'cx';
export type RouteConditionType = 'accident' | 'rain' | 'road_block' | 'traffic' | 'road_work';
export type RouteConditionSeverity = 'low' | 'medium' | 'high';

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
