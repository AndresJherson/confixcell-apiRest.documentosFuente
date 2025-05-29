import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoEntradaBienConsumoService } from './documento-entrada-bien-consumo.service';

describe('DocumentoEntradaBienConsumoService', () => {
  let service: DocumentoEntradaBienConsumoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoEntradaBienConsumoService],
    }).compile();

    service = module.get<DocumentoEntradaBienConsumoService>(DocumentoEntradaBienConsumoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
