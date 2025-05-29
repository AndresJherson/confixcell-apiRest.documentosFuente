import { Test, TestingModule } from '@nestjs/testing';
import { ComprobanteTipoController } from './comprobante-tipo.controller';

describe('ComprobanteTipoController', () => {
  let controller: ComprobanteTipoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComprobanteTipoController],
    }).compile();

    controller = module.get<ComprobanteTipoController>(ComprobanteTipoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
