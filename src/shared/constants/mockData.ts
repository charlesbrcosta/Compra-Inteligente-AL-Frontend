import { GeoLocation, Market, ShoppingProduct, User, Vehicle } from '@/shared/types/entities';

export const mockUser: User = {
  id: 'user-demo',
  name: 'Ana Beatriz Silva',
  email: 'ana@email.com',
  city: 'Maceio',
  neighborhood: 'Ponta Verde',
};

export const mockVehicle: Vehicle = {
  id: 'vehicle-demo',
  model: 'Hyundai HB20 1.0',
  fuelType: 'gasolina',
  averageConsumptionKmPerLiter: 12,
  fuelPricePerLiter: 5.89,
};

export const mockCurrentLocation: GeoLocation = {
  latitude: -9.6614,
  longitude: -35.7047,
  label: 'Posicao atual mockada - Ponta Verde, Maceio',
};

export const mockProducts: ShoppingProduct[] = [
  { id: 'prod-1', name: 'Arroz parboilizado', quantity: 2, unit: 'kg' },
  { id: 'prod-2', name: 'Feijao carioca', quantity: 1, unit: 'kg' },
  { id: 'prod-3', name: 'Leite integral', quantity: 6, unit: 'l' },
  { id: 'prod-4', name: 'Cafe tradicional', quantity: 1, unit: 'pct' },
];

export const mockMarkets: Market[] = [
  {
    id: 'market-1',
    name: 'Palato Ponta Verde',
    type: 'supermercado',
    address: 'Av. Dr. Antonio Gouveia, Ponta Verde, Maceio - AL',
    city: 'Maceio',
    neighborhood: 'Ponta Verde',
    distanceKm: 1.8,
    location: {
      latitude: -9.6624,
      longitude: -35.7042,
      label: 'Palato Ponta Verde',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 6.49 },
      { productName: 'Feijao carioca', unit: 'kg', price: 8.79 },
      { productName: 'Leite integral', unit: 'l', price: 5.39 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 13.9 },
      { productName: 'Acucar cristal', unit: 'kg', price: 4.59 },
      { productName: 'Oleo de soja', unit: 'un', price: 6.99 },
    ],
  },
  {
    id: 'market-2',
    name: 'Assai Atacadista Maceio',
    type: 'atacadista',
    address: 'Av. Menino Marcelo, Cidade Universitaria, Maceio - AL',
    city: 'Maceio',
    neighborhood: 'Cidade Universitaria',
    distanceKm: 10.4,
    location: {
      latitude: -9.5596,
      longitude: -35.7771,
      label: 'Assai Atacadista Maceio',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 5.49 },
      { productName: 'Feijao carioca', unit: 'kg', price: 7.69 },
      { productName: 'Leite integral', unit: 'l', price: 4.69 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 12.49 },
      { productName: 'Acucar cristal', unit: 'kg', price: 3.99 },
      { productName: 'Oleo de soja', unit: 'un', price: 5.99 },
    ],
  },
  {
    id: 'market-3',
    name: 'Atacadao Tabuleiro',
    type: 'atacadista',
    address: 'Av. Durval de Goes Monteiro, Tabuleiro do Martins, Maceio - AL',
    city: 'Maceio',
    neighborhood: 'Tabuleiro do Martins',
    distanceKm: 12.7,
    location: {
      latitude: -9.5703,
      longitude: -35.7677,
      label: 'Atacadao Tabuleiro',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 5.29 },
      { productName: 'Feijao carioca', unit: 'kg', price: 7.49 },
      { productName: 'Leite integral', unit: 'l', price: 4.79 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 11.99 },
      { productName: 'Acucar cristal', unit: 'kg', price: 3.89 },
      { productName: 'Oleo de soja', unit: 'un', price: 5.89 },
    ],
  },
  {
    id: 'market-4',
    name: 'GBarbosa Farol',
    type: 'supermercado',
    address: 'Av. Fernandes Lima, Farol, Maceio - AL',
    city: 'Maceio',
    neighborhood: 'Farol',
    distanceKm: 5.3,
    location: {
      latitude: -9.6358,
      longitude: -35.7355,
      label: 'GBarbosa Farol',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 6.19 },
      { productName: 'Feijao carioca', unit: 'kg', price: 8.19 },
      { productName: 'Leite integral', unit: 'l', price: 5.19 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 13.29 },
      { productName: 'Acucar cristal', unit: 'kg', price: 4.39 },
      { productName: 'Oleo de soja', unit: 'un', price: 6.49 },
    ],
  },
  {
    id: 'market-5',
    name: 'Unicompra Jatiuca',
    type: 'supermercado',
    address: 'Rua Jose Pontes de Magalhaes, Jatiuca, Maceio - AL',
    city: 'Maceio',
    neighborhood: 'Jatiuca',
    distanceKm: 3.1,
    location: {
      latitude: -9.6492,
      longitude: -35.7001,
      label: 'Unicompra Jatiuca',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 6.29 },
      { productName: 'Feijao carioca', unit: 'kg', price: 8.49 },
      { productName: 'Leite integral', unit: 'l', price: 5.09 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 12.99 },
      { productName: 'Acucar cristal', unit: 'kg', price: 4.29 },
      { productName: 'Oleo de soja', unit: 'un', price: 6.39 },
    ],
  },
  {
    id: 'market-6',
    name: 'Mix Mateus Arapiraca',
    type: 'atacadista',
    address: 'Av. Governador Lamenha Filho, Arapiraca - AL',
    city: 'Arapiraca',
    neighborhood: 'Baixao',
    distanceKm: 126.5,
    location: {
      latitude: -9.7501,
      longitude: -36.6616,
      label: 'Mix Mateus Arapiraca',
    },
    products: [
      { productName: 'Arroz parboilizado', unit: 'kg', price: 5.19 },
      { productName: 'Feijao carioca', unit: 'kg', price: 7.29 },
      { productName: 'Leite integral', unit: 'l', price: 4.59 },
      { productName: 'Cafe tradicional', unit: 'pct', price: 11.79 },
      { productName: 'Acucar cristal', unit: 'kg', price: 3.79 },
      { productName: 'Oleo de soja', unit: 'un', price: 5.79 },
    ],
  },
];
