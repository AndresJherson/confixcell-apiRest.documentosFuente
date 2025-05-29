import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoEntradaEfectivoController } from './documento-entrada-efectivo.controller';

describe('DocumentoEntradaEfectivoController', () => {
  let controller: DocumentoEntradaEfectivoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoEntradaEfectivoController],
    }).compile();

    controller = module.get<DocumentoEntradaEfectivoController>(DocumentoEntradaEfectivoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
