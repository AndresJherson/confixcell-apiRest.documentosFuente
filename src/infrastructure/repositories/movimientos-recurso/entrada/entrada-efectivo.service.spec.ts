import { Test, TestingModule } from '@nestjs/testing';
import { EntradaEfectivoService } from './entrada-efectivo.service';

describe('EntradaEfectivoService', () => {
  let service: EntradaEfectivoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntradaEfectivoService],
    }).compile();

    service = module.get<EntradaEfectivoService>(EntradaEfectivoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
