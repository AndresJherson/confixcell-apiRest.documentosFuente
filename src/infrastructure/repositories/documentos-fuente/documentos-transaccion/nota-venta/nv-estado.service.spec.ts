import { Test, TestingModule } from '@nestjs/testing';
import { NvEstadoService } from './nv-estado.service';

describe('NvEstadoService', () => {
  let service: NvEstadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NvEstadoService],
    }).compile();

    service = module.get<NvEstadoService>(NvEstadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
