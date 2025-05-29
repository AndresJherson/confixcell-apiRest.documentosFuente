import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoEntradaEfectivoService } from './documento-entrada-efectivo.service';

describe('DocumentoEntradaEfectivoService', () => {
  let service: DocumentoEntradaEfectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoEntradaEfectivoService],
    }).compile();

    service = module.get<DocumentoEntradaEfectivoService>(DocumentoEntradaEfectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
