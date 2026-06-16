import { apiRequest } from '@/shared/api/apiClient';
import { SefazFuelSummary, SefazProductPrice } from '@/shared/types/entities';

export class ApiSefazRepository {
  searchProducts(description: string) {
    return apiRequest<{ source: 'sefaz'; cityIbgeCode: number; products: SefazProductPrice[] }>(
      `/sefaz/products/search?description=${encodeURIComponent(description)}`,
      { authenticated: true },
    );
  }

  getCurrentFuelPrice() {
    return apiRequest<SefazFuelSummary>('/sefaz/fuel/current', { authenticated: true });
  }
}
