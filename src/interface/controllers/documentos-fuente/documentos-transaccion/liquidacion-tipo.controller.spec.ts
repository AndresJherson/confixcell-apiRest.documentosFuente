import { Test, TestingModule } from '@nestjs/testing';
import { LiquidacionTipoController } from './liquidacion-tipo.controller';

describe('LiquidacionTipoController', () => {
  let controller: LiquidacionTipoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiquidacionTipoController],
    }).compile();

    controller = module.get<LiquidacionTipoController>(LiquidacionTipoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
