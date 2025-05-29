import { Test, TestingModule } from '@nestjs/testing';
import { SalidaBienConsumoService } from './salida-bien-consumo.service';

describe('SalidaBienConsumoService', () => {
  let service: SalidaBienConsumoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalidaBienConsumoService],
    }).compile();

    service = module.get<SalidaBienConsumoService>(SalidaBienConsumoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
