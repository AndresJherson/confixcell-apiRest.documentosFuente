import { Test, TestingModule } from '@nestjs/testing';
import { NotaTransaccionEntradaService } from './nota-transaccion-entrada.service';

describe('NotaTransaccionEntradaService', () => {
  let service: NotaTransaccionEntradaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotaTransaccionEntradaService],
    }).compile();

    service = module.get<NotaTransaccionEntradaService>(NotaTransaccionEntradaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
