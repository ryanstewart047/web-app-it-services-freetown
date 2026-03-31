import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address. Usage: node make-admin.mjs <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.technician.findUnique({ where: { email } });

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    await prisma.technician.update({
      where: { email },
      data: { role: 'admin' }
    });

    console.log(`Success! ${user.name} (${email}) is now an admin.`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
