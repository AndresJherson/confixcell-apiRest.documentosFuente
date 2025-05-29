import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoEntradaBienConsumoController } from './documento-entrada-bien-consumo.controller';

describe('DocumentoEntradaBienConsumoController', () => {
  let controller: DocumentoEntradaBienConsumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoEntradaBienConsumoController],
    }).compile();

    controller = module.get<DocumentoEntradaBienConsumoController>(DocumentoEntradaBienConsumoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
