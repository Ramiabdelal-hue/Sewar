import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Lessons for Category A (Motorcycles)
  const lessonsA = [
    { id: 4, title: "Motorfiets wetgeving (A) - Introductie", questionType: "Theori" },
    { id: 9, title: "Veiligheidsuitrusting en helm", questionType: "Theori" },
    { id: 10, title: "Balans en manoeuvres op de weg", questionType: "Theori" },
    { id: 11, title: "Correcte positionering in de rijstrook", questionType: "Theori" },
    { id: 12, title: "Verkeersborden specifiek voor motoren", questionType: "Theori" },
    { id: 13, title: "Omgaan met bochten en gladde oppervlakken", questionType: "Theori" },
    { id: 14, title: "Passagiers en lading op de motor", questionType: "Theori" },
    { id: 15, title: "Basis motorfiets mechanica", questionType: "Theori" },
    { id: 16, title: "Zicht en dode hoeken voor motoren", questionType: "Theori" },
    { id: 17, title: "Snelheidsregels voor lichte motoren", questionType: "Theori" },
    { id: 18, title: "Eerste hulp voor motorrijders", questionType: "Theori" },
    { id: 19, title: "Rijden in groepen", questionType: "Theori" },
    { id: 20, title: "Proefexamen categorie A", questionType: "Examen" }
  ];

  // Lessons for Category B (Cars)
  const lessonsB = [
    { id: 6, title: "Auto wetgeving (B) - Introductie", questionType: "Theori" },
    { id: 21, title: "Snelheden binnen en buiten de stad", questionType: "Theori" },
    { id: 22, title: "Voorrangsregels en kruispunten", questionType: "Theori" },
    { id: 23, title: "Verticale verkeersborden", questionType: "Theori" },
    { id: 24, title: "Wegmarkeringen en lijnen", questionType: "Theori" },
    { id: 25, title: "Correct parkeren en stoppen", questionType: "Theori" },
    { id: 26, title: "Veilig inhalen en manoeuvres", questionType: "Theori" },
    { id: 27, title: "Lichte auto mechanica", questionType: "Theori" },
    { id: 28, title: "Zicht en rijden in moeilijke omstandigheden", questionType: "Theori" },
    { id: 29, title: "Economisch rijden (Eco-Driving)", questionType: "Theori" },
    { id: 30, title: "Ongevallen en wettelijke aansprakelijkheid", questionType: "Theori" },
    { id: 31, title: "Kwetsbare weggebruikers (voetgangers)", questionType: "Theori" },
    { id: 32, title: "Proefexamen categorie B", questionType: "Examen" }
  ];

  // Lessons for Category C (Trucks)
  const lessonsC = [
    { id: 33, title: "Vrachtwagen wetgeving (C) - Gewichten en afmetingen", questionType: "Theori" },
    { id: 34, title: "Tachograaf en rusttijden", questionType: "Theori" },
    { id: 35, title: "Ladingverdeling en lading beveiligen", questionType: "Theori" },
    { id: 36, title: "Zware voertuig mechanica", questionType: "Theori" },
    { id: 37, title: "Luchtremsystemen (Air Brakes)", questionType: "Theori" },
    { id: 38, title: "Dode hoeken in grote voertuigen", questionType: "Theori" },
    { id: 39, title: "Verkeersregels voor zwaar transport", questionType: "Theori" },
    { id: 40, title: "Verboden wegen en hoogtebeperkingen", questionType: "Theori" },
    { id: 41, title: "Internationale documenten en carnets", questionType: "Theori" },
    { id: 42, title: "Banden vervangen en pech afhandelen", questionType: "Theori" },
    { id: 43, title: "Veilig laden en lossen", questionType: "Theori" },
    { id: 44, title: "Pre-trip inspectie voor vrachtwagens", questionType: "Theori" },
    { id: 45, title: "Proefexamen categorie C", questionType: "Examen" }
  ];

  // Seed LessonA table
  console.log('📚 Seeding Category A lessons...');
  for (const lesson of lessonsA) {
    await prisma.lessonA.upsert({
      where: { id: lesson.id },
      update: {},
      create: lesson
    });
    console.log(`✅ Created/Updated LessonA: ${lesson.title}`);
  }

  // Seed LessonB table
  console.log('📚 Seeding Category B lessons...');
  for (const lesson of lessonsB) {
    await prisma.lessonB.upsert({
      where: { id: lesson.id },
      update: {},
      create: lesson
    });
    console.log(`✅ Created/Updated LessonB: ${lesson.title}`);
  }

  // Seed LessonC table
  console.log('📚 Seeding Category C lessons...');
  for (const lesson of lessonsC) {
    await prisma.lessonC.upsert({
      where: { id: lesson.id },
      update: {},
      create: lesson
    });
    console.log(`✅ Created/Updated LessonC: ${lesson.title}`);
  }

  // Praktijk - Oefenvideo's (Training Videos)
  const praktijkOefenvideos = [
    { id: 1, title: "Basis rijvaardigheden - Starten en stoppen", type: "training" },
    { id: 2, title: "Achteruit rijden en parkeren", type: "training" },
    { id: 3, title: "Bochten nemen en sturen", type: "training" },
    { id: 4, title: "Inhalen en van rijstrook wisselen", type: "training" },
    { id: 5, title: "Rotondes en kruispunten", type: "training" },
    { id: 6, title: "Rijden op de snelweg", type: "training" },
    { id: 7, title: "Noodstop en defensief rijden", type: "training" }
  ];

  // Praktijk - Gevaarherkenning (Hazard Perception)
  const praktijkGevaarherkenning = [
    { id: 8, title: "Gevaarherkenning - Voetgangers en fietsers", type: "hazard" },
    { id: 9, title: "Gevaarherkenning - Kruispunten", type: "hazard" },
    { id: 10, title: "Gevaarherkenning - Snelweg situaties", type: "hazard" },
    { id: 11, title: "Gevaarherkenning - Weersomstandigheden", type: "hazard" },
    { id: 12, title: "Gevaarherkenning - Dode hoeken", type: "hazard" },
    { id: 13, title: "Gevaarherkenning - Noodsituaties", type: "hazard" }
  ];

  // Seed Praktijk Oefenvideo's
  console.log('🎥 Seeding Praktijk Oefenvideo\'s...');
  for (const item of praktijkOefenvideos) {
    await prisma.praktijkLesson.upsert({
      where: { id: item.id },
      update: {},
      create: item
    });
    console.log(`✅ Created/Updated PraktijkLesson: ${item.title}`);
  }

  // Seed Praktijk Gevaarherkenning
  console.log('⚠️ Seeding Praktijk Gevaarherkenning...');
  for (const item of praktijkGevaarherkenning) {
    await prisma.praktijkLesson.upsert({
      where: { id: item.id },
      update: {},
      create: item
    });
    console.log(`✅ Created/Updated PraktijkLesson: ${item.title}`);
  }

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
