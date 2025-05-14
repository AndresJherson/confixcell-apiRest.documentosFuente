import { Test, TestingModule } from '@nestjs/testing';
import { NvCategoriaReparacionController } from './nv-categoria-reparacion.controller';

describe('NvCategoriaReparacionController', () => {
  let controller: NvCategoriaReparacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NvCategoriaReparacionController],
    }).compile();

    controller = module.get<NvCategoriaReparacionController>(NvCategoriaReparacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
