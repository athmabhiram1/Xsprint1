const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('\n📊 Database Users:');
  console.log('==================');
  if (users.length === 0) {
    console.log('No users found');
  } else {
    users.forEach(u => {
      console.log(`- ${u.email} (${u.role}) - ID: ${u.id}`);
    });
  }
  await prisma.$disconnect();
}

main().catch(console.error);
