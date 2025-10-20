import { IsArray, IsInt, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChoiceDto { 
  @ApiProperty({
    description: 'Choice ID',
    example: 'choice_1',
    type: 'string'
  })
  @IsString() 
  id: string; 
  
  @ApiProperty({
    description: 'Choice text',
    example: 'Option A',
    type: 'string'
  })
  @IsString() 
  text: string; 
}

class QuestionDto {
  @ApiProperty({
    description: 'Question index in the quiz',
    example: 1,
    type: 'number'
  })
  @IsInt() 
  index: number;
  
  @ApiProperty({
    description: 'Question text',
    example: 'What is the capital of Turkey?',
    type: 'string'
  })
  @IsString() 
  text: string;
  
  @ApiProperty({
    description: 'Question type',
    example: 'MCQ',
    enum: ['MCQ', 'TF'],
    type: 'string'
  })
  @IsEnum(['MCQ','TF'] as any) 
  type: 'MCQ' | 'TF';
  
  @ApiProperty({
    description: 'Answer choices for MCQ questions',
    example: [
      { id: 'choice_1', text: 'Istanbul' },
      { id: 'choice_2', text: 'Ankara' },
      { id: 'choice_3', text: 'Izmir' },
      { id: 'choice_4', text: 'Bursa' }
    ],
    type: [ChoiceDto],
    required: false
  })
  @IsOptional() 
  @IsArray() 
  @ValidateNested({ each: true }) 
  @Type(() => ChoiceDto) 
  choices?: ChoiceDto[];
  
  @ApiProperty({
    description: 'Correct answer',
    example: 'choice_2',
    type: 'string',
    required: false
  })
  @IsOptional() 
  correctAnswer?: any; // basit
  
  @ApiProperty({
    description: 'Time limit in seconds',
    example: 30,
    type: 'number'
  })
  @IsInt() 
  timeLimitSec: number;
  
  @ApiProperty({
    description: 'Points for this question',
    example: 10,
    type: 'number'
  })
  @IsInt() 
  points: number;
}

export class CreateQuizDto {
  @ApiProperty({
    description: 'Quiz title',
    example: 'Turkey Geography Quiz',
    type: 'string'
  })
  @IsString() 
  title: string;
  
  @ApiProperty({
    description: 'Quiz settings',
    example: {
      shuffleQuestions: true,
      showCorrectAnswers: false,
      allowRetake: true
    },
    type: 'object',
    required: false
  })
  @IsOptional() 
  settings?: any;
  
  @ApiProperty({
    description: 'Quiz questions',
    example: [
      {
        index: 1,
        text: 'What is the capital of Turkey?',
        type: 'MCQ',
        choices: [
          { id: 'choice_1', text: 'Istanbul' },
          { id: 'choice_2', text: 'Ankara' },
          { id: 'choice_3', text: 'Izmir' },
          { id: 'choice_4', text: 'Bursa' }
        ],
        correctAnswer: 'choice_2',
        timeLimitSec: 30,
        points: 10
      },
      {
        index: 2,
        text: 'Is Turkey located in Europe?',
        type: 'TF',
        correctAnswer: true,
        timeLimitSec: 15,
        points: 5
      }
    ],
    type: [QuestionDto]
  })
  @IsArray() 
  @ValidateNested({ each: true }) 
  @Type(() => QuestionDto) 
  questions: QuestionDto[];
}