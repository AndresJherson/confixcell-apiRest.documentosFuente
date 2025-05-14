import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoSalidaEfectivoController } from './documento-salida-efectivo.controller';

describe('DocumentoSalidaEfectivoController', () => {
  let controller: DocumentoSalidaEfectivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoSalidaEfectivoController],
    }).compile();

    controller = module.get<DocumentoSalidaEfectivoController>(DocumentoSalidaEfectivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
