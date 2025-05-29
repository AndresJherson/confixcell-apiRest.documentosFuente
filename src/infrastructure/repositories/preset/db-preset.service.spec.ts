import { Test, TestingModule } from '@nestjs/testing';
import { DbPresetService } from './db-preset.service';

describe('DbPresetService', () => {
  let service: DbPresetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbPresetService],
    }).compile();

    service = module.get<DbPresetService>(DbPresetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
