import { Test, TestingModule } from '@nestjs/testing';
import { AnswerSetsService } from './answer-sets.service';

describe('AnswerSetsService', () => {
  let service: AnswerSetsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnswerSetsService],
    }).compile();

    service = module.get<AnswerSetsService>(AnswerSetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
