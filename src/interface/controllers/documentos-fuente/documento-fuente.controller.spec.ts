import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoFuenteController } from './documento-fuente.controller';

describe('DocumentoFuenteController', () => {
  let controller: DocumentoFuenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoFuenteController],
    }).compile();

    controller = module.get<DocumentoFuenteController>(DocumentoFuenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
