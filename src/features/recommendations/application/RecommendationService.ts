import { DistanceService } from '@/features/map/application/DistanceService';
import { GeoLocation, Market, Recommendation, ShoppingProduct, Vehicle } from '@/shared/types/entities';

export class RecommendationService {
  constructor(private readonly distanceService = new DistanceService()) {}

  calculateDisplacementCost(distanceKm: number, consumptionKmPerLiter: number, fuelPricePerLiter: number) {
    if (consumptionKmPerLiter <= 0 || fuelPricePerLiter <= 0) {
      return 0;
    }

    return ((distanceKm * 2) / consumptionKmPerLiter) * fuelPricePerLiter;
  }

  calculateProductsTotal(products: ShoppingProduct[], market: Market) {
    return products.reduce((total, product) => {
      const marketProduct = this.findMarketProduct(product, market);
      return marketProduct ? total + marketProduct.price * product.quantity : total;
    }, 0);
  }

  getMissingProducts(products: ShoppingProduct[], market: Market) {
    return products.filter((product) => !this.findMarketProduct(product, market));
  }

  buildRecommendations(
    products: ShoppingProduct[],
    markets: Market[],
    vehicle: Vehicle | null,
    currentLocation?: GeoLocation,
  ): Recommendation[] {
    const marketsWithCurrentDistance = currentLocation
      ? markets.map((market) => this.distanceService.applyCurrentLocationDistance(market, currentLocation))
      : markets;

    const recommendations = marketsWithCurrentDistance.map((market) => {
      const productsTotal = this.calculateProductsTotal(products, market);
      const displacementCost = vehicle
        ? this.calculateDisplacementCost(
            market.distanceKm,
            vehicle.averageConsumptionKmPerLiter,
            vehicle.fuelPricePerLiter,
          )
        : 0;
      const finalTotal = productsTotal + displacementCost;

      return {
        market,
        productsTotal,
        displacementCost,
        finalTotal,
        estimatedSavings: 0,
        missingProducts: this.getMissingProducts(products, market),
        isBest: false,
      };
    });

    const sorted = [...recommendations].sort((a, b) => a.finalTotal - b.finalTotal);
    const best = sorted[0];

    return sorted.map((recommendation) => ({
      ...recommendation,
      estimatedSavings: Math.max(0, recommendation.finalTotal - best.finalTotal),
      isBest: recommendation.market.id === best.market.id,
    }));
  }

  private findMarketProduct(product: ShoppingProduct, market: Market) {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

    return market.products.find((marketProduct) => normalize(marketProduct.productName) === normalize(product.name));
  }
}
