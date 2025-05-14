import { Test, TestingModule } from '@nestjs/testing';
import { NvPrioridadService } from './nv-prioridad.service';

describe('NvPrioridadService', () => {
  let service: NvPrioridadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NvPrioridadService],
    }).compile();

    service = module.get<NvPrioridadService>(NvPrioridadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
