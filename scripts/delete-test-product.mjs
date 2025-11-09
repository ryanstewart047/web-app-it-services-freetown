import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestProduct() {
  try {
    // Find all products with "Test" in the name
    const products = await prisma.product.findMany({
      where: {
        name: {
          contains: 'Test',
          mode: 'insensitive'
        }
      }
    });
    
    console.log('Found products:', products.map(p => ({ id: p.id, name: p.name, slug: p.slug })));
    
    if (products.length === 0) {
      console.log('No test products found');
      return;
    }
    
    // Delete each test product
    for (const product of products) {
      console.log(`Deleting product: ${product.name} (ID: ${product.id})`);
      await prisma.product.delete({ where: { id: product.id } });
      console.log(`✓ Deleted: ${product.name}`);
    }
    
    console.log('\nAll test products deleted successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestProduct();
