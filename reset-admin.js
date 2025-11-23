const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAdmin() {
  try {
    console.log('Deleting admin user...');
    const deleteUser = await prisma.user.deleteMany({
      where: {
        email: 'admin@test.com',
      },
    });
    console.log(`Deleted ${deleteUser.count} users.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
