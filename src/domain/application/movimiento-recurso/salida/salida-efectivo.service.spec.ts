import { Test, TestingModule } from '@nestjs/testing';
import { SalidaEfectivoService } from './salida-efectivo.service';

describe('SalidaEfectivoService', () => {
  let service: SalidaEfectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalidaEfectivoService],
    }).compile();

    service = module.get<SalidaEfectivoService>(SalidaEfectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
