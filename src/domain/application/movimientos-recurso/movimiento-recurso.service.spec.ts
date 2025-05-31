import { Test, TestingModule } from '@nestjs/testing';
import { MovimientoRecursoService } from './movimiento-recurso.service';

describe('MovimientoRecursoService', () => {
  let service: MovimientoRecursoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovimientoRecursoService],
    }).compile();

    service = module.get<MovimientoRecursoService>(MovimientoRecursoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
