import { Test, TestingModule } from '@nestjs/testing';
import { NvCategoriaReparacionService } from './nv-categoria-reparacion.service';

describe('NvCategoriaReparacionService', () => {
  let service: NvCategoriaReparacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NvCategoriaReparacionService],
    }).compile();

    service = module.get<NvCategoriaReparacionService>(NvCategoriaReparacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
