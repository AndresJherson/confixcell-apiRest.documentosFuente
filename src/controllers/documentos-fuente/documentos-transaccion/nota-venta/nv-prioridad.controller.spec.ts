import { Test, TestingModule } from '@nestjs/testing';
import { NvPrioridadController } from './nv-prioridad.controller';

describe('NvPrioridadController', () => {
  let controller: NvPrioridadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NvPrioridadController],
    }).compile();

    controller = module.get<NvPrioridadController>(NvPrioridadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
