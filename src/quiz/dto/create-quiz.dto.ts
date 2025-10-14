import { IsArray, IsInt, IsOptional, IsString, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';


class ChoiceDto { @IsString() id: string; @IsString() text: string; }


class QuestionDto {
@IsInt() index: number;
@IsString() text: string;
@IsEnum(['MCQ','TF'] as any) type: 'MCQ' | 'TF';
@IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ChoiceDto) choices?: ChoiceDto[];
@IsOptional() correctAnswer?: any; // basit
@IsInt() timeLimitSec: number;
@IsInt() points: number;
}


export class CreateQuizDto {
@IsString() title: string;
@IsOptional() settings?: any;
@IsArray() @ValidateNested({ each: true }) @Type(() => QuestionDto) questions: QuestionDto[];
}