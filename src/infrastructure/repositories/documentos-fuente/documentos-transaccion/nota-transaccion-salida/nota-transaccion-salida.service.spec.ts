import { Test, TestingModule } from '@nestjs/testing';
import { NotaTransaccionSalidaService } from './nota-transaccion-salida.service';

describe('NotaTransaccionSalidaService', () => {
  let service: NotaTransaccionSalidaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotaTransaccionSalidaService],
    }).compile();

    service = module.get<NotaTransaccionSalidaService>(NotaTransaccionSalidaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
