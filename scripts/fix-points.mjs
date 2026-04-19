import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // عدد الأسئلة التي عليها 5 نقاط
  const count = await prisma.examQuestionB.count({ where: { points: 5 } });
  console.log(`عدد الأسئلة بـ 5 نقاط في ExamQuestionB: ${count}`);

  if (count === 0) {
    console.log('لا توجد أسئلة بـ 5 نقاط.');
    return;
  }

  // تحديث جميعها إلى 1
  const result = await prisma.examQuestionB.updateMany({
    where: { points: 5 },
    data: { points: 1 },
  });

  console.log(`✅ تم تحديث ${result.count} سؤال من 5 نقاط إلى 1 نقطة.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
