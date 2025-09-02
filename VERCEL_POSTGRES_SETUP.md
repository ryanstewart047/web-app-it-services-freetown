# Setting Up Vercel Postgres for IT Services Freetown

This guide provides detailed steps for setting up and working with Vercel Postgres for your IT Services Freetown application.

## Why Vercel Postgres?

- **Integrated Solution**: Seamlessly works with your Vercel-hosted Next.js application
- **Free Tier**: Includes 256MB of storage with 1 project (sufficient for small applications)
- **Managed Service**: Automatic backups, updates, and scaling
- **Simple Connection**: Environment variables automatically configured

## Step 1: Creating a Vercel Postgres Database

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. In the sidebar, click on **Storage**
3. Click on **Create Database**
4. Select **Postgres** as the database type
5. Choose a region close to your target audience (e.g., Europe for African customers)
6. Give your database a name (e.g., `it-services-freetown-db`)
7. Click **Create**

## Step 2: Link the Database to Your Project

1. After creating the database, click **Connect to Project**
2. Select your IT Services Freetown project
3. Click **Connect**
4. Vercel will automatically add the `POSTGRES_URL` environment variables to your project

## Step 3: Set Up Your Local Environment

To work with the database locally:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your local project:
   ```bash
   cd /path/to/web-app-it-services-freetown
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.development.local
   ```

4. Verify your database connection in `.env.development.local` - you should see:
   ```
   POSTGRES_URL=...
   POSTGRES_PRISMA_URL=...
   POSTGRES_URL_NON_POOLING=...
   POSTGRES_USER=...
   POSTGRES_HOST=...
   POSTGRES_PASSWORD=...
   POSTGRES_DATABASE=...
   ```

## Step 4: Update Prisma Configuration

Update your `prisma/schema.prisma` file to use the Vercel Postgres connection:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING") // Used for migrations
}

// Rest of your schema...
```

## Step 5: Running Migrations

Deploy your database schema:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create a SQL migration file in `prisma/migrations`
2. Apply the migration to your Vercel Postgres database
3. Generate Prisma Client based on your schema

## Step 6: Seeding Initial Data (Optional)

To add initial data to your database:

1. Create a seed script in `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add your seed data here
  // Example:
  await prisma.serviceType.createMany({
    data: [
      { name: 'Laptop Repair', description: 'Repair services for laptops' },
      { name: 'Mobile Phone Repair', description: 'Repair services for mobile phones' },
      { name: 'Troubleshooting', description: 'General troubleshooting services' },
    ],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

2. Configure seed script in `package.json`:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

3. Run the seed script:

```bash
npx prisma db seed
```

## Step 7: Exploring Your Database

To browse and manage your database:

1. Using Prisma Studio locally:
   ```bash
   npx prisma studio
   ```
   This opens a browser interface at http://localhost:5555

2. Using Vercel Dashboard:
   - Go to your Vercel project
   - Click on **Storage**
   - Select your Postgres database
   - Click on **Browse** tab

## Common Commands

Here are some useful commands when working with Vercel Postgres:

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset the database (CAUTION: deletes all data)
npx prisma migrate reset

# Check database status
npx prisma db pull
```

## Troubleshooting

### Connection Issues

If you encounter database connection issues:

1. Check that your environment variables are correctly set
2. Ensure your IP is allowed if you're using IP restrictions
3. Verify your Prisma schema is using the correct environment variable
4. Try using the non-pooled connection URL for troubleshooting:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL_NON_POOLING")
   }
   ```

### Migration Issues

If migrations fail:

1. Check Vercel logs for detailed error messages
2. Ensure you have the latest Prisma version: `npm install prisma@latest`
3. Try with `--create-only` flag to inspect migration before applying:
   ```bash
   npx prisma migrate dev --name fix_issue --create-only
   ```

## Monitoring and Performance

1. Check database performance in Vercel Dashboard:
   - Go to your Vercel project
   - Click on **Storage**
   - Select your Postgres database
   - Click on **Metrics** tab

2. Set up alerts for storage usage:
   - In your database view, click on **Settings**
   - Configure **Usage Alerts**

## Resources

- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js with Prisma Example](https://github.com/vercel/next.js/tree/canary/examples/with-prisma)
