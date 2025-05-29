import { Test, TestingModule } from '@nestjs/testing';
import { MedioTransferenciaController } from './medio-transferencia.controller';

describe('MedioTransferenciaController', () => {
  let controller: MedioTransferenciaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedioTransferenciaController],
    }).compile();

    controller = module.get<MedioTransferenciaController>(MedioTransferenciaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
