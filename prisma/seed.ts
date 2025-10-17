import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';


const prisma = new PrismaClient();


async function main() {
const adminPass = await argon.hash('Admin123!');
const admin = await prisma.user.upsert({
where: { email: 'admin@example.com' },
update: {},
create: { email: 'admin@example.com', passwordHash: adminPass }
});


const quiz = await prisma.quiz.create({
data: {
title: 'Demo Quiz',
createdBy: admin.id,
settings: { bonusMax: 50 },
questions: {
create: [
{
indexInQuiz: 1, // Zorunlu alan eklendi
text: '2+2=?',
type: 'MCQ',
choices: [{ id: 'A', text: '3' }, { id: 'B', text: '4' }],
correctAnswer: { id: 'B' },
timeLimitSec: 20,
points: 100
}
]
}
}
});


console.log('Seeded admin and quiz:', admin.email, quiz.title);
}


main()
.catch((e) => { console.error(e); process.exit(1); })
.finally(async () => { await prisma.$disconnect(); });