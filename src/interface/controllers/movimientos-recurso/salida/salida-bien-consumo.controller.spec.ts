import { Test, TestingModule } from '@nestjs/testing';
import { SalidaBienConsumoController } from './salida-bien-consumo.controller';

describe('SalidaBienConsumoController', () => {
  let controller: SalidaBienConsumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalidaBienConsumoController],
    }).compile();

    controller = module.get<SalidaBienConsumoController>(SalidaBienConsumoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
