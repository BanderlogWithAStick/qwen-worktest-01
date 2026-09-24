import { Manager, Customer, Category, Product, Sale, SaleStatus } from '../types';

// Seeded random for reproducibility
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }
}

const rng = new SeededRandom(42);

const teamColors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
const teams = ['Enterprise Sales', 'SMB Sales', 'Channel Partners', 'Government', 'Key Accounts'];

const managerNames = [
  'Алексей Петров', 'Мария Иванова', 'Дмитрий Сидоров', 'Елена Козлова',
  'Сергей Новиков', 'Анна Морозова', 'Игорь Волков', 'Ольга Соловьёва',
  'Павел Лебедев', 'Наталья Кузнецова', 'Андрей Попов', 'Татьяна Васильева',
  'Михаил Зайцев', 'Екатерина Павлова', 'Николай Семёнов', 'Юлия Голубева',
  'Виктор Виноградов', 'Светлана Богданова', 'Роман Воробьёв', 'Ирина Фёдорова'
];

export const managers: Manager[] = managerNames.map((name, i) => ({
  id: i + 1,
  name,
  team: teams[i % teams.length],
  initials: name.split(' ').map(n => n[0]).join(''),
  color: teamColors[i % teamColors.length],
}));

const companyNames = [
  'ТехноСервис', 'АльфаГрупп', 'МегаСтрой', 'ИнноВат', 'ПрофИТ',
  'ДатаЛайн', 'СмартСистемы', 'ГлобалТех', 'НеоФорм', 'КиберЩит',
  'РосИнтеграция', 'ВебСолюшнз', 'ПраймТек', 'АйТиМастер', 'ДиджиТранс',
  'ЛогистикПро', 'МедиаПлюс', 'ЭнергоСбыт', 'АгроХолдинг', 'ФинКонсалт',
  'СтройИнвест', 'ТоргСервис', 'АвтоПарт', 'ФудЛайн', 'ЭкоПром',
  'ТелекомМ', 'КлинингМастер', 'ОфисПлюс', 'МаркетПро', 'БизнесЛайн',
  'ТрансЛогистик', 'МедТех', 'СпецОдежда', 'ХимПром', 'МеталлТрейд',
  'ЛесПром', 'НефтеГаз', 'АтомЭнерго', 'КосмоТех', 'БиоФарм'
];

const segments: Array<'Enterprise' | 'SMB' | 'Startup' | 'Government'> = ['Enterprise', 'SMB', 'Startup', 'Government'];

export const customers: Customer[] = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  name: companyNames[i % companyNames.length] + (i >= companyNames.length ? ` ${Math.floor(i / companyNames.length) + 1}` : ''),
  company: companyNames[i % companyNames.length],
  segment: segments[i % segments.length],
}));

export const categories: Category[] = [
  { id: 1, name: 'Дроны', color: '#3b82f6' },
  { id: 2, name: 'Аксессуары', color: '#8b5cf6' },
  { id: 3, name: 'Камеры', color: '#06b6d4' },
  { id: 4, name: 'Стабилизаторы', color: '#10b981' },
  { id: 5, name: 'Батареи и зарядки', color: '#f59e0b' },
  { id: 6, name: 'Программное обеспечение', color: '#ef4444' },
];

export const products: Product[] = [
  { id: 1, name: 'DJI Mavic 3 Pro', categoryId: 1, price: 215000, cost: 150000 },
  { id: 2, name: 'DJI Air 3', categoryId: 1, price: 125000, cost: 85000 },
  { id: 3, name: 'DJI Mini 4 Pro', categoryId: 1, price: 89000, cost: 60000 },
  { id: 4, name: 'DJI Matrice 350 RTK', categoryId: 1, price: 650000, cost: 450000 },
  { id: 5, name: 'DJI Avata 2', categoryId: 1, price: 95000, cost: 65000 },
  { id: 6, name: 'DJI Inspire 3', categoryId: 1, price: 1200000, cost: 850000 },
  { id: 7, name: 'DJI Fly More Kit', categoryId: 2, price: 18000, cost: 10000 },
  { id: 8, name: 'DJI RC Pro', categoryId: 2, price: 62000, cost: 40000 },
  { id: 9, name: 'DJI ND Filter Set', categoryId: 2, price: 8500, cost: 4500 },
  { id: 10, name: 'DJI Propellers (pair)', categoryId: 2, price: 1200, cost: 600 },
  { id: 11, name: 'DJI Care Refresh', categoryId: 2, price: 15000, cost: 8000 },
  { id: 12, name: 'DJI RS 4 Pro', categoryId: 4, price: 72000, cost: 48000 },
  { id: 13, name: 'DJI RS 4', categoryId: 4, price: 45000, cost: 30000 },
  { id: 14, name: 'DJI Ronin-S', categoryId: 4, price: 35000, cost: 23000 },
  { id: 15, name: 'DJI Osmo Pocket 3', categoryId: 3, price: 55000, cost: 37000 },
  { id: 16, name: 'DJI Osmo Action 4', categoryId: 3, price: 38000, cost: 25000 },
  { id: 17, name: 'DJI Action 4 Creator Combo', categoryId: 3, price: 52000, cost: 35000 },
  { id: 18, name: 'DJI Battery (Mavic 3)', categoryId: 5, price: 14000, cost: 8000 },
  { id: 19, name: 'DJI Charging Hub', categoryId: 5, price: 7500, cost: 4000 },
  { id: 20, name: 'DJI Power Station', categoryId: 5, price: 45000, cost: 28000 },
  { id: 21, name: 'DJI Terra License', categoryId: 6, price: 120000, cost: 70000 },
  { id: 22, name: 'DJI Flight Simulator', categoryId: 6, price: 35000, cost: 18000 },
  { id: 23, name: 'DJI Mavic 3 Classic', categoryId: 1, price: 155000, cost: 108000 },
  { id: 24, name: 'DJI Mini 3', categoryId: 1, price: 52000, cost: 35000 },
  { id: 25, name: 'DJI Transmission', categoryId: 2, price: 85000, cost: 55000 },
];

// Generate sales over 12 months
function generateSales(): Sale[] {
  const sales: Sale[] = [];
  const startDate = new Date('2025-01-01');
  const endDate = new Date('2025-12-31');
  let saleId = 1;

  // Manager performance multipliers (some are strong, some weak)
  const managerMultipliers = managers.map((_, i) => {
    if (i < 4) return 1.5 + rng.next() * 0.8; // Top performers
    if (i < 10) return 0.8 + rng.next() * 0.6; // Average
    return 0.3 + rng.next() * 0.5; // Weak performers
  });

  // Seasonality: higher in Q4, lower in Q1
  const seasonality = [0.7, 0.75, 0.85, 0.9, 0.95, 1.0, 0.85, 0.9, 1.0, 1.1, 1.3, 1.4];

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(2025, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2025, month, day);
      if (date > endDate) break;
      
      // Skip some weekends randomly
      if (date.getDay() === 0 && rng.next() > 0.3) continue;
      if (date.getDay() === 6 && rng.next() > 0.5) continue;

      const seasonalFactor = seasonality[month];

      managers.forEach((manager, mi) => {
        const multiplier = managerMultipliers[mi];
        // Base chance of sale per day
        const baseChance = 0.4 * multiplier * seasonalFactor;
        
        if (rng.next() < baseChance) {
          const numSales = rng.nextInt(1, Math.ceil(multiplier * 2));
          
          for (let s = 0; s < numSales; s++) {
            const customer = rng.pick(customers);
            const numItems = rng.nextInt(1, 4);
            const items = [];
            
            for (let j = 0; j < numItems; j++) {
              const product = rng.pick(products);
              const quantity = rng.nextInt(1, Math.ceil(3 * multiplier));
              items.push({
                productId: product.id,
                quantity,
                unitPrice: product.price,
                unitCost: product.cost,
              });
            }

            // Status distribution
            let status: SaleStatus = 'Paid';
            const statusRoll = rng.next();
            if (statusRoll > 0.92) status = 'Cancelled';
            else if (statusRoll > 0.85) status = 'Refunded';

            sales.push({
              id: saleId++,
              managerId: manager.id,
              customerId: customer.id,
              date: date.toISOString().split('T')[0],
              status,
              items,
            });
          }
        }
      });
    }
  }

  return sales;
}

export const sales: Sale[] = generateSales();

// Helper to get product by id
export function getProduct(id: number): Product | undefined {
  return products.find(p => p.id === id);
}

export function getCustomer(id: number): Customer | undefined {
  return customers.find(c => c.id === id);
}

export function getManager(id: number): Manager | undefined {
  return managers.find(m => m.id === id);
}

export function getCategory(id: number): Category | undefined {
  return categories.find(c => c.id === id);
}
