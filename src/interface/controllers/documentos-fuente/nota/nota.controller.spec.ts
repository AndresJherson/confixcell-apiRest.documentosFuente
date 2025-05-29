import { Test, TestingModule } from '@nestjs/testing';
import { NotaController } from './nota.controller';

describe('NotaController', () => {
  let controller: NotaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotaController],
    }).compile();

    controller = module.get<NotaController>(NotaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
