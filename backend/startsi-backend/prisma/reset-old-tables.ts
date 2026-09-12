import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all public schema tables in Supabase...');
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS "public"."' || quote_ident(r.tablename) || '" CASCADE';
        END LOOP;
    END $$;
  `);
  console.log('All public schema tables successfully dropped!');
}

main()
  .catch((e) => {
    console.error('Reset error:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
