import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateAnswerSetDto } from '../dto/create-answer-set.dto';
import { UpdateAnswerSetDto } from '../dto/update-answer-set.dto';
import { AnswerSetsService } from '../services/answer-sets.service';

@ApiTags('Answers Sets')
@Controller('answer-sets')
export class AnswerSetsController {
  constructor(private readonly answerSetsService: AnswerSetsService) {}

  @Post()
  create(@Body() createAnswerSetDto: CreateAnswerSetDto) {
    return this.answerSetsService.create(createAnswerSetDto);
  }

  @Get()
  findAll() {
    return this.answerSetsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answerSetsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAnswerSetDto: UpdateAnswerSetDto
  ) {
    return this.answerSetsService.update(id, updateAnswerSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answerSetsService.remove(id);
  }
}
