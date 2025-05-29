import { Test, TestingModule } from '@nestjs/testing';
import { IntegridadController } from './integridad.controller';

describe('IntegridadController', () => {
  let controller: IntegridadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntegridadController],
    }).compile();

    controller = module.get<IntegridadController>(IntegridadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
