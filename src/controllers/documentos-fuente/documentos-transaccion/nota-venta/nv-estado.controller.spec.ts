import { Test, TestingModule } from '@nestjs/testing';
import { NvEstadoController } from './nv-estado.controller';

describe('NvEstadoController', () => {
  let controller: NvEstadoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NvEstadoController],
    }).compile();

    controller = module.get<NvEstadoController>(NvEstadoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
