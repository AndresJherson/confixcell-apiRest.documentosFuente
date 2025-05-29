import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoMovimientoController } from './documento-movimiento.controller';

describe('DocumentoMovimientoController', () => {
  let controller: DocumentoMovimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoMovimientoController],
    }).compile();

    controller = module.get<DocumentoMovimientoController>(DocumentoMovimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
