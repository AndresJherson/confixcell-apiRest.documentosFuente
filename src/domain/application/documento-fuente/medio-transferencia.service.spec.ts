import { Test, TestingModule } from '@nestjs/testing';
import { MedioTransferenciaService } from './medio-transferencia.service';

describe('MedioTransferenciaService', () => {
  let service: MedioTransferenciaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedioTransferenciaService],
    }).compile();

    service = module.get<MedioTransferenciaService>(MedioTransferenciaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
