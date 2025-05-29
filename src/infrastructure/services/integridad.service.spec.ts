import { Test, TestingModule } from '@nestjs/testing';
import { IntegridadService } from './integridad.service';

describe('IntegridadService', () => {
  let service: IntegridadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntegridadService],
    }).compile();

    service = module.get<IntegridadService>(IntegridadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
