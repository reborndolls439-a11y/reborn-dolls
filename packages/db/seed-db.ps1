$env:DATABASE_URL = "postgresql://postgres.odrypzxqprwvysdxmusj:wXpKo5BpqgEANTNZ@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
$env:DIRECT_URL = "postgresql://postgres.odrypzxqprwvysdxmusj:wXpKo5BpqgEANTNZ@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
npx tsx prisma/seed.ts
