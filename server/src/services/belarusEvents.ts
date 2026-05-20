import { EventStatus } from '@prisma/client';
import { env } from '../env.js';
import { prisma } from '../db.js';

export interface BelarusEventInput {
  externalId: string;
  title: string;
  description: string;
  sportName: string;
  sportIcon: string;
  venueName: string;
  city: string;
  address: string;
  startsAt: Date;
  source: string;
  sourceUrl: string;
  minPrice: number;
  sectorName: string;
  rows: number;
  seatsPerRow: number;
}

export interface BelarusImportResult {
  created: number;
  updated: number;
  skipped: number;
  events: BelarusEventInput[];
}

interface RawEventRecord {
  [key: string]: unknown;
}

const officialSourceUrl = 'https://mst.gov.by/en/belarus-sportivnaya/kalendar-sobytij.html';

const seededBelarusEvents: BelarusEventInput[] = [
  {
    externalId: 'mst-minsk-half-marathon-2026',
    title: 'Минский полумарафон',
    description: 'Массовый легкоатлетический старт в центре Минска.',
    sportName: 'Лёгкая атлетика',
    sportIcon: '🏃',
    venueName: 'Национальный олимпийский стадион Динамо',
    city: 'Минск',
    address: 'ул. Кирова, 8',
    startsAt: new Date('2026-09-13T09:00:00+03:00'),
    source: 'Министерство спорта Республики Беларусь',
    sourceUrl: officialSourceUrl,
    minPrice: 25,
    sectorName: 'Стартовый пакет',
    rows: 1,
    seatsPerRow: 500,
  },
  {
    externalId: 'mst-dinamo-minsk-hockey-2026',
    title: 'Динамо-Минск — Неман',
    description: 'Хоккейный матч регулярного сезона на минской арене.',
    sportName: 'Хоккей',
    sportIcon: '🏒',
    venueName: 'Минск-Арена',
    city: 'Минск',
    address: 'пр. Победителей, 111',
    startsAt: new Date('2026-02-21T19:10:00+03:00'),
    source: 'Министерство спорта Республики Беларусь',
    sourceUrl: officialSourceUrl,
    minPrice: 18,
    sectorName: 'Трибуна A',
    rows: 12,
    seatsPerRow: 24,
  },
  {
    externalId: 'mst-belarus-football-cup-2026',
    title: 'Кубок Беларуси по футболу',
    description: 'Матч национального футбольного турнира.',
    sportName: 'Футбол',
    sportIcon: '⚽',
    venueName: 'Национальный олимпийский стадион Динамо',
    city: 'Минск',
    address: 'ул. Кирова, 8',
    startsAt: new Date('2026-05-24T18:00:00+03:00'),
    source: 'Министерство спорта Республики Беларусь',
    sourceUrl: officialSourceUrl,
    minPrice: 12,
    sectorName: 'Центральная трибуна',
    rows: 10,
    seatsPerRow: 30,
  },
  {
    externalId: 'mst-brest-rowing-2026',
    title: 'Республиканские соревнования по гребле',
    description: 'Соревнования белорусских спортсменов на гребном канале.',
    sportName: 'Гребля',
    sportIcon: '🚣',
    venueName: 'Брестский гребной канал',
    city: 'Брест',
    address: 'ул. Октябрьской Революции, 2',
    startsAt: new Date('2026-06-20T11:00:00+03:00'),
    source: 'Министерство спорта Республики Беларусь',
    sourceUrl: officialSourceUrl,
    minPrice: 10,
    sectorName: 'Зрительская зона',
    rows: 6,
    seatsPerRow: 40,
  },
];

function readString(record: RawEventRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return undefined;
}

function readNumber(record: RawEventRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(',', '.'));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

function readNestedRecord(record: RawEventRecord, key: string): RawEventRecord | undefined {
  const value = record[key];
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as RawEventRecord;
  }
  return undefined;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function sportIcon(sportName: string): string {
  const name = sportName.toLowerCase();
  if (name.includes('хок') || name.includes('hockey')) return '🏒';
  if (name.includes('фут') || name.includes('football')) return '⚽';
  if (name.includes('баскет') || name.includes('basket')) return '🏀';
  if (name.includes('теннис') || name.includes('tennis')) return '🎾';
  if (name.includes('волей') || name.includes('volley')) return '🏐';
  if (name.includes('бег') || name.includes('атлет') || name.includes('run')) return '🏃';
  return '🏟️';
}

function rawEventsFromPayload(payload: unknown): RawEventRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is RawEventRecord => typeof item === 'object' && item !== null);
  }
  if (typeof payload !== 'object' || payload === null) return [];
  const record = payload as RawEventRecord;
  const arrayKeys = ['events', 'items', 'data', 'results'];
  for (const key of arrayKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is RawEventRecord => typeof item === 'object' && item !== null);
    }
  }
  return [];
}

function normalizeApiEvent(record: RawEventRecord, index: number, sourceUrl: string): BelarusEventInput | null {
  const venue = readNestedRecord(record, 'venue') ?? {};
  const location = readNestedRecord(record, 'location') ?? {};
  const title = readString(record, ['title', 'name', 'eventName', 'event_name']);
  const startsAt = parseDate(readString(record, ['startsAt', 'starts_at', 'date', 'datetime', 'startDate']));
  if (!title || !startsAt) return null;

  const sportName = readString(record, ['sport', 'sportName', 'sport_name', 'category']) ?? 'Спорт';
  const venueName =
    readString(record, ['venueName', 'venue_name', 'place']) ??
    readString(venue, ['name', 'title']) ??
    'Спортивная площадка';
  const city =
    readString(record, ['city', 'town']) ??
    readString(venue, ['city', 'town']) ??
    readString(location, ['city', 'town']) ??
    'Минск';
  const address =
    readString(record, ['address']) ??
    readString(venue, ['address']) ??
    readString(location, ['address']) ??
    city;
  const externalId =
    readString(record, ['id', 'externalId', 'external_id', 'uid', 'slug']) ??
    `${title}-${startsAt.toISOString()}-${index}`;
  const source = readString(record, ['source', 'provider']) ?? 'Belarus Events API';

  return {
    externalId,
    title,
    description: readString(record, ['description', 'summary', 'annotation']) ?? '',
    sportName,
    sportIcon: readString(record, ['sportIcon', 'sport_icon', 'icon']) ?? sportIcon(sportName),
    venueName,
    city,
    address,
    startsAt,
    source,
    sourceUrl: readString(record, ['sourceUrl', 'source_url', 'url', 'link']) ?? sourceUrl,
    minPrice: readNumber(record, ['minPrice', 'min_price', 'price', 'ticketPrice']) ?? 15,
    sectorName: readString(record, ['sector', 'sectorName', 'ticketCategory']) ?? 'Стандарт',
    rows: readNumber(record, ['rows']) ?? 8,
    seatsPerRow: readNumber(record, ['seatsPerRow', 'seats_per_row', 'capacity']) ?? 20,
  };
}

async function fetchConfiguredEvents(): Promise<BelarusEventInput[]> {
  if (!env.BELARUS_EVENTS_API_URL) return seededBelarusEvents;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (env.BELARUS_EVENTS_API_KEY) headers.Authorization = `Bearer ${env.BELARUS_EVENTS_API_KEY}`;

  const response = await fetch(env.BELARUS_EVENTS_API_URL, { headers });
  if (!response.ok) {
    throw new Error(`Belarus events API responded with ${response.status}`);
  }

  const payload = await response.json();
  const normalized = rawEventsFromPayload(payload)
    .map((record, index) => normalizeApiEvent(record, index, env.BELARUS_EVENTS_API_URL!))
    .filter((event): event is BelarusEventInput => event !== null);

  return normalized.length > 0 ? normalized : seededBelarusEvents;
}

export async function getBelarusEventsPreview(): Promise<BelarusEventInput[]> {
  return fetchConfiguredEvents();
}

export async function importBelarusEvents(): Promise<BelarusImportResult> {
  const events = await fetchConfiguredEvents();
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const eventData of events) {
    if (eventData.startsAt.getTime() < Date.now()) {
      skipped += 1;
      continue;
    }

    const sport = await prisma.sport.upsert({
      where: { name: eventData.sportName },
      update: { icon: eventData.sportIcon },
      create: { name: eventData.sportName, icon: eventData.sportIcon },
    });

    let venue = await prisma.venue.findFirst({
      where: { name: eventData.venueName, city: eventData.city },
    });
    venue ??= await prisma.venue.create({
      data: {
        name: eventData.venueName,
        city: eventData.city,
        address: eventData.address,
      },
    });

    const sector = await prisma.sector.upsert({
      where: { venueId_name: { venueId: venue.id, name: eventData.sectorName } },
      update: {
        rows: eventData.rows,
        seatsPerRow: eventData.seatsPerRow,
      },
      create: {
        venueId: venue.id,
        name: eventData.sectorName,
        rows: eventData.rows,
        seatsPerRow: eventData.seatsPerRow,
      },
    });

    const existing = await prisma.event.findUnique({
      where: {
        source_externalId: {
          source: eventData.source,
          externalId: eventData.externalId,
        },
      },
    });

    const event = existing
      ? await prisma.event.update({
          where: { id: existing.id },
          data: {
            title: eventData.title,
            description: eventData.description,
            sportId: sport.id,
            venueId: venue.id,
            startsAt: eventData.startsAt,
            sourceUrl: eventData.sourceUrl,
            status: EventStatus.ON_SALE,
          },
        })
      : await prisma.event.create({
          data: {
            title: eventData.title,
            description: eventData.description,
            sportId: sport.id,
            venueId: venue.id,
            startsAt: eventData.startsAt,
            status: EventStatus.ON_SALE,
            source: eventData.source,
            sourceUrl: eventData.sourceUrl,
            externalId: eventData.externalId,
          },
        });

    if (existing) updated += 1;
    else created += 1;

    await prisma.ticketType.upsert({
      where: {
        eventId_sectorId_name: {
          eventId: event.id,
          sectorId: sector.id,
          name: 'Стандарт',
        },
      },
      update: { price: eventData.minPrice },
      create: {
        eventId: event.id,
        sectorId: sector.id,
        name: 'Стандарт',
        price: eventData.minPrice,
      },
    });
  }

  return { created, updated, skipped, events };
}
