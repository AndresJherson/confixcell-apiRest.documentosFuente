import { Test, TestingModule } from '@nestjs/testing';
import { LiquidacionTipoService } from './liquidacion-tipo.service';

describe('LiquidacionTipoService', () => {
  let service: LiquidacionTipoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiquidacionTipoService],
    }).compile();

    service = module.get<LiquidacionTipoService>(LiquidacionTipoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
