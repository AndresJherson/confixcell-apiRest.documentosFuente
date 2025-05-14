import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoMovimientoService } from './documento-movimiento.service';

describe('DocumentoMovimientoService', () => {
  let service: DocumentoMovimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoMovimientoService],
    }).compile();

    service = module.get<DocumentoMovimientoService>(DocumentoMovimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
