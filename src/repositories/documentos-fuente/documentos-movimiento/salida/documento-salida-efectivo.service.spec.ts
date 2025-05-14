import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoSalidaEfectivoService } from './documento-salida-efectivo.service';

describe('DocumentoSalidaEfectivoService', () => {
  let service: DocumentoSalidaEfectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoSalidaEfectivoService],
    }).compile();

    service = module.get<DocumentoSalidaEfectivoService>(DocumentoSalidaEfectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
