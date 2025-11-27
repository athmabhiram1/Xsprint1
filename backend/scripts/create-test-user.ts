import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
    console.log('🔧 Creating test user: admin@test.com\n');

    // Check if user already exists
    const existing = await prisma.user.findUnique({
        where: { email: 'admin@test.com' }
    });

    if (existing) {
        console.log('✅ User already exists. Updating password...\n');

        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        await prisma.user.update({
            where: { email: 'admin@test.com' },
            data: { passwordHash: hashedPassword }
        });

        console.log('✅ Password updated successfully!\n');
    } else {
        console.log('Creating new user...\n');

        const hashedPassword = await bcrypt.hash('Admin123!', 10);

        const user = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@test.com',
                passwordHash: hashedPassword,
                role: 'ADMIN'
            }
        });

        console.log('✅ User created successfully!\n');
        console.log('📋 Details:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: Admin123!`);
        console.log(`   Role: ${user.role}\n`);
    }
}

createTestUser()
    .catch((e) => {
        console.error('❌ Error:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
