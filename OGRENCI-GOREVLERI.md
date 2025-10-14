# 🎓 ÖĞRENCİ GÖREVLERİ - HSD Arena Quiz Platformu

## 📋 Genel Bilgiler

Bu proje, NestJS + Prisma + PostgreSQL + Redis tabanlı gerçek-zamanlı quiz platformudur. 
2 öğrenciye ayrı görevler verilecektir.

## 🚀 Projeyi Çalıştırma

### 1. Kurulum
```bash
# Bağımlılıkları yükle
npm install

# Prisma client'ı generate et
npm run prisma:generate

# Database migration'ları uygula
npm run db:deploy

# Seed data'yı yükle
npm run seed

# Uygulamayı başlat
npm run start:dev
```

### 2. Test Etme
- **Swagger UI**: `http://localhost:8082/docs`
- **Admin Login**: `admin@example.com` / `Admin123!`

## 👥 GÖREV DAĞILIMI

---

## 🎯 GÖREV 1: TEAM ENDPOINT'LERİ
**Görevli Öğrenci**: [İsim]

### 📝 Görev Açıklaması
Takım katılımı için gerekli endpoint'leri yazacaksınız.

### 🔧 Yapılacaklar

#### 1. Team Module Oluşturma
```bash
# src/team/ klasörü oluşturun
mkdir src/team
```

#### 2. Team Service (src/team/team.service.ts)
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TeamService {
  constructor(
    private prisma: PrismaService, 
    private auth: AuthService
  ) {}

  async join(sessionCode: string, teamName: string) {
    // 1. Session'ı sessionCode ile bul
    // 2. Team oluştur (sessionId ve teamName ile)
    // 3. Team token oluştur (AuthService.signTeamToken kullan)
    // 4. { teamId, teamToken } döndür
  }
}
```

#### 3. Team Controller (src/team/team.controller.ts)
```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody } from '@nestjs/swagger';
import { TeamService } from './team.service';

interface JoinTeamDto {
  sessionCode: string;
  teamName: string;
}

@ApiTags('team')
@Controller('team')
export class TeamController {
  constructor(private readonly service: TeamService) {}

  @ApiBody({
    description: 'Team join request',
    schema: {
      type: 'object',
      properties: {
        sessionCode: { type: 'string', example: 'ABC123' },
        teamName: { type: 'string', example: 'Red Dragons' }
      },
      required: ['sessionCode', 'teamName']
    }
  })
  @Post('join')
  join(@Body() body: JoinTeamDto) {
    return this.service.join(body.sessionCode, body.teamName);
  }
}
```

#### 4. Team Module (src/team/team.module.ts)
```typescript
import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
```

#### 5. App Module'e Ekleme
`src/app.module.ts` dosyasına TeamModule'ü ekleyin.

### 🧪 Test Etme
```bash
# 1. Admin login yapın
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "Admin123!"
}

# 2. Quiz oluşturun
POST /api/quiz/create
# (Quiz ID'yi kopyalayın)

# 3. Session başlatın
POST /api/quiz/{quizId}/session
# (Session Code'u kopyalayın)

# 4. Team join test edin
POST /api/team/join
{
  "sessionCode": "ABC123",
  "teamName": "Red Dragons"
}
```

### ✅ Beklenen Response
```json
{
  "teamId": "team-uuid-here",
  "teamToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 🎯 GÖREV 2: ANSWER ENDPOINT'LERİ
**Görevli Öğrenci**: [İsim]

### 📝 Görev Açıklaması
Cevap gönderme için gerekli endpoint'leri yazacaksınız.

### 🔧 Yapılacaklar

#### 1. Answer Module Oluşturma
```bash
# src/answer/ klasörü oluşturun
mkdir src/answer
mkdir src/answer/dto
```

#### 2. Submit Answer DTO (src/answer/dto/submit-answer.dto.ts)
```typescript
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
```

#### 3. Answer Service (src/answer/answer.service.ts)
```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@Injectable()
export class AnswerService {
  constructor(private prisma: PrismaService) {}

  async submit(dto: SubmitAnswerDto, teamId: string) {
    const { sessionId, questionId, answerPayload, nonce } = dto;

    // 1. Session'ı kontrol et
    // 2. Question'ı kontrol et
    // 3. Question'ın bu session'a ait olduğunu kontrol et
    // 4. Duplicate submission kontrolü
    // 5. Cevabı doğrula ve puan hesapla
    // 6. Cevabı kaydet
    // 7. Response döndür
  }

  private validateAnswer(question: any, answerPayload: any): boolean {
    // MCQ ve TF soruları için doğrulama
  }
}
```

#### 4. Answer Controller (src/answer/answer.controller.ts)
```typescript
import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamJwtGuard } from '../common/guards/team-jwt.guard';
import { AnswerService } from './answer.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';

@ApiTags('answer')
@ApiBearerAuth('team-token')
@Controller('answer')
export class AnswerController {
  constructor(private readonly service: AnswerService) {}

  @ApiOperation({ 
    summary: 'Submit answer to a question',
    description: 'Submit an answer to a specific question in a quiz session.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Answer submitted successfully'
  })
  @UseGuards(TeamJwtGuard)
  @Post()
  submit(@Body() body: SubmitAnswerDto, @Req() req: any) {
    // TeamJwtGuard'dan teamId'yi al
    // AnswerService.submit'i çağır
  }
}
```

#### 5. Answer Module (src/answer/answer.module.ts)
```typescript
import { Module } from '@nestjs/common';
import { AnswerController } from './answer.controller';
import { AnswerService } from './answer.service';
import { PrismaModule } from '../infra/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnswerController],
  providers: [AnswerService],
})
export class AnswerModule {}
```

#### 6. App Module'e Ekleme
`src/app.module.ts` dosyasına AnswerModule'ü ekleyin.

### 🧪 Test Etme
```bash
# 1. Team join yapın (Görev 1'den team token alın)
POST /api/team/join
{
  "sessionCode": "ABC123",
  "teamName": "Red Dragons"
}

# 2. Soruları alın
GET /api/quiz/session/{sessionId}/questions

# 3. Answer submit test edin
POST /api/answer
{
  "sessionId": "session-uuid",
  "questionId": "question-uuid",
  "answerPayload": { "id": "B" },
  "nonce": "client-123"
}
```

### ✅ Beklenen Response
```json
{
  "answerId": "answer-uuid-here",
  "isCorrect": true,
  "pointsAwarded": 100,
  "submittedAt": "2025-10-14T13:30:00.000Z",
  "message": "Correct answer!"
}
```

---

## 📚 Yardımcı Kaynaklar

### Prisma Schema (Mevcut)
```prisma
model Team {
  id            String      @id @default(uuid()) @db.Uuid
  sessionId     String      @db.Uuid
  name          String
  disqualified  Boolean     @default(false)
  joinedAt      DateTime    @default(now())
  session       QuizSession @relation(fields: [sessionId], references: [id])
  answers       Answer[]

  @@unique([sessionId, name])
}

model Answer {
  id             String      @id @default(uuid()) @db.Uuid
  sessionId      String      @db.Uuid
  questionId     String      @db.Uuid
  teamId         String      @db.Uuid
  answerPayload  Json
  isCorrect      Boolean
  pointsAwarded  Int         @default(0)
  answeredAt     DateTime    @default(now())
  latencyMs      Int?
  session        QuizSession @relation(fields: [sessionId], references: [id])
  question       Question    @relation(fields: [questionId], references: [id])
  team           Team        @relation(fields: [teamId], references: [id])

  @@unique([sessionId, questionId, teamId])
  @@index([teamId])
}
```

### AuthService (Mevcut)
```typescript
// Team token oluşturmak için kullanın
async signTeamToken(teamId: string, sessionId: string) {
  const payload = { sub: `team:${teamId}`, role: 'team', teamId, sessionId };
  return this.jwt.signAsync(payload, {
    secret: process.env.JWT_TEAM_SECRET,
    expiresIn: process.env.JWT_EXP_TEAM || '60m',
    algorithm: 'HS256'
  });
}
```

### TeamJwtGuard (Mevcut)
```typescript
// Team token'ı doğrulamak için kullanın
// req.user'da teamId bilgisi olacak
```

## 🎯 Başarı Kriterleri

### Görev 1 (Team Endpoints)
- [ ] Team join endpoint'i çalışıyor
- [ ] Session code ile team oluşturuluyor
- [ ] Team token döndürülüyor
- [ ] Swagger documentation mevcut
- [ ] Error handling yapılmış

### Görev 2 (Answer Endpoints)
- [ ] Answer submit endpoint'i çalışıyor
- [ ] Team token ile authentication yapılıyor
- [ ] Cevap doğrulama yapılıyor
- [ ] Puan hesaplama yapılıyor
- [ ] Duplicate submission engelleniyor
- [ ] Swagger documentation mevcut
- [ ] Error handling yapılmış

## 🚀 Teslim

1. Kodunuzu GitHub'a push edin
2. Swagger UI'da test edin
3. README.md'ye test sonuçlarını ekleyin
4. Hangi endpoint'leri yazdığınızı belirtin

**Başarılar! 🎉**
