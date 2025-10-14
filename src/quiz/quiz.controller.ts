import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';


@ApiTags('quiz')
@ApiBearerAuth('admin-token')
@Controller('quiz')
export class QuizController {
constructor(private readonly service: QuizService) {}


@UseGuards(AdminJwtGuard)
@Post('create')
create(@Req() req: any, @Body() dto: CreateQuizDto) {
// req.user.sub -> admin id
return this.service.createQuiz(req.user.sub, dto);
}


@UseGuards(AdminJwtGuard)
@Post(':quizId/session')
createSession(@Param('quizId') quizId: string, @Body() _dto: CreateSessionDto) {
return this.service.createSession(quizId);
}

@UseGuards(AdminJwtGuard)
@Get(':quizId/questions')
getQuizQuestions(@Param('quizId') quizId: string) {
return this.service.getQuizQuestions(quizId);
}

@Get('session/:sessionId/questions')
getSessionQuestions(@Param('sessionId') sessionId: string) {
return this.service.getSessionQuestions(sessionId);
}
}