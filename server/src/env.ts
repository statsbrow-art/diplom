import 'dotenv/config';

const required = ['DATABASE_URL', 'JWT_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  PORT: Number(process.env.PORT ?? 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  BELARUS_EVENTS_API_URL: process.env.BELARUS_EVENTS_API_URL,
  BELARUS_EVENTS_API_KEY: process.env.BELARUS_EVENTS_API_KEY,
  CIS_SPORTS_API_URL: process.env.CIS_SPORTS_API_URL ?? 'https://www.thesportsdb.com/api/v1/json/3',
};
