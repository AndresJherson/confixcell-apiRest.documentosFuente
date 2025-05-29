import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoSalidaBienConsumoService } from './documento-salida-bien-consumo.service';

describe('DocumentoSalidaBienConsumoService', () => {
  let service: DocumentoSalidaBienConsumoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoSalidaBienConsumoService],
    }).compile();

    service = module.get<DocumentoSalidaBienConsumoService>(DocumentoSalidaBienConsumoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
