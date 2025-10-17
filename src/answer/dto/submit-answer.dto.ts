import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsObject } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'The ID of the quiz session',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'The ID of the question being answered',
    example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1',
  })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description:
      'The answer payload, format depends on the question type. E.g., { "id": "A" } for MCQ or { "value": true } for TF.',
    example: { id: 'A' },
    type: 'object',
    properties: {
      id: { type: 'string' },
      value: { type: 'boolean' },
    },
  })
  @IsObject()
  @IsNotEmpty()
  answerPayload: Record<string, any>;

  @ApiProperty({
    description:
      'A unique client-generated string to prevent duplicate submissions',
    example: 'client-nonce-12345',
  })
  @IsString()
  @IsNotEmpty()
  nonce: string;
}