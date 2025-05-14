import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoSalidaBienConsumoController } from './documento-salida-bien-consumo.controller';

describe('DocumentoSalidaBienConsumoController', () => {
  let controller: DocumentoSalidaBienConsumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoSalidaBienConsumoController],
    }).compile();

    controller = module.get<DocumentoSalidaBienConsumoController>(DocumentoSalidaBienConsumoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
