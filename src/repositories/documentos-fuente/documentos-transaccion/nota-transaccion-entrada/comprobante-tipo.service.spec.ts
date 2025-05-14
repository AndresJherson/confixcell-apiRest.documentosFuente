import { Test, TestingModule } from '@nestjs/testing';
import { ComprobanteTipoService } from './comprobante-tipo.service';

describe('ComprobanteTipoService', () => {
  let service: ComprobanteTipoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComprobanteTipoService],
    }).compile();

    service = module.get<ComprobanteTipoService>(ComprobanteTipoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
