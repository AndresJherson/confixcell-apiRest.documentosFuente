import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoTransaccionController } from './documento-transaccion.controller';

describe('DocumentoTransaccionController', () => {
  let controller: DocumentoTransaccionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoTransaccionController],
    }).compile();

    controller = module.get<DocumentoTransaccionController>(DocumentoTransaccionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
