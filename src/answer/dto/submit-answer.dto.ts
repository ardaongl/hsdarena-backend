import { IsString, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAnswerDto {
  @ApiProperty({
    description: 'Session ID where the answer is being submitted',
    example: '12345678-1234-1234-1234-123456789012'
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Question ID being answered',
    example: '87654321-4321-4321-4321-210987654321'
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Answer payload - format depends on question type',
    examples: {
      MCQ: { id: 'A' },
      TF: { value: true }
    }
  })
  @IsObject()
  @IsNotEmpty()
  answerPayload: any;

  @ApiProperty({
    description: 'Unique nonce to prevent duplicate submissions',
    example: 'client-unique-123'
  })
  @IsString()
  @IsNotEmpty()
  nonce: string;
}
