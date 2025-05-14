import { Test, TestingModule } from '@nestjs/testing';
import { SalidaProduccionService } from './salida-produccion.service';

describe('SalidaProduccionService', () => {
  let service: SalidaProduccionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalidaProduccionService],
    }).compile();

    service = module.get<SalidaProduccionService>(SalidaProduccionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
