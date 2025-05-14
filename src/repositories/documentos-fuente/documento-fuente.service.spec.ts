import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoFuenteService } from './documento-fuente.service';

describe('DocumentoFuenteService', () => {
  let service: DocumentoFuenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoFuenteService],
    }).compile();

    service = module.get<DocumentoFuenteService>(DocumentoFuenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
