import { Test, TestingModule } from '@nestjs/testing';
import { NotaTransaccionSalidaController } from './nota-transaccion-salida.controller';

describe('NotaTransaccionSalidaController', () => {
  let controller: NotaTransaccionSalidaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotaTransaccionSalidaController],
    }).compile();

    controller = module.get<NotaTransaccionSalidaController>(NotaTransaccionSalidaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
