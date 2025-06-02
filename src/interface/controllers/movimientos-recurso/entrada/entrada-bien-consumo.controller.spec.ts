import { Test, TestingModule } from '@nestjs/testing';
import { EntradaBienConsumoController } from './entrada-bien-consumo.controller';

describe('EntradaBienConsumoController', () => {
  let controller: EntradaBienConsumoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntradaBienConsumoController],
    }).compile();

    controller = module.get<EntradaBienConsumoController>(EntradaBienConsumoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
