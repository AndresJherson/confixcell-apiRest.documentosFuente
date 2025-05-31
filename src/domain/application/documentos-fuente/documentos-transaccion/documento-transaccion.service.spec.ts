import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoTransaccionService } from './documento-transaccion.service';

describe('DocumentoTransaccionService', () => {
  let service: DocumentoTransaccionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoTransaccionService],
    }).compile();

    service = module.get<DocumentoTransaccionService>(DocumentoTransaccionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
