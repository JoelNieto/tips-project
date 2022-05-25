import { Test, TestingModule } from '@nestjs/testing';

import { AnswerSetsService } from '../../answer-sets/answer-sets.service';
import { AnswerSetsController } from './answer-sets.controller';

describe('AnswerSetsController', () => {
  let controller: AnswerSetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnswerSetsController],
      providers: [AnswerSetsService],
    }).compile();

    controller = module.get<AnswerSetsController>(AnswerSetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
