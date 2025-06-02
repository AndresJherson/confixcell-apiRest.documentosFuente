import { Test, TestingModule } from '@nestjs/testing';
import { DbPresetController } from './db-preset.controller';

describe('DbPresetController', () => {
  let controller: DbPresetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DbPresetController],
    }).compile();

    controller = module.get<DbPresetController>(DbPresetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
