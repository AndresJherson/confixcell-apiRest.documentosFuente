import { Test, TestingModule } from '@nestjs/testing';
import { EntradaBienConsumoService } from './entrada-bien-consumo.service';

describe('EntradaBienConsumoService', () => {
  let service: EntradaBienConsumoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntradaBienConsumoService],
    }).compile();

    service = module.get<EntradaBienConsumoService>(EntradaBienConsumoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
