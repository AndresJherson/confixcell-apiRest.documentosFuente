import { Test, TestingModule } from '@nestjs/testing';
import { NotaTransaccionEntradaController } from './nota-transaccion-entrada.controller';

describe('NotaTransaccionEntradaController', () => {
  let controller: NotaTransaccionEntradaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotaTransaccionEntradaController],
    }).compile();

    controller = module.get<NotaTransaccionEntradaController>(NotaTransaccionEntradaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
