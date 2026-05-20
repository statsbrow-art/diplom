import { EventStatus } from '@prisma/client';
import { prisma } from '../db.js';
import { env } from '../env.js';

export interface CisEventInput {
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
}

export interface CisImportResult {
  created: number;
  updated: number;
  skipped: number;
  events: CisEventInput[];
}

interface SportsDbLeague {
  idLeague?: string;
  strLeague?: string;
  strSport?: string;
  strCountry?: string;
}

interface SportsDbEvent {
  idEvent?: string;
  strEvent?: string;
  strSport?: string;
  strLeague?: string;
  strCountry?: string;
  strVenue?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strDescriptionEN?: string;
  strPoster?: string;
  strThumb?: string;
}

const countries = ['Russia', 'Kazakhstan', 'Georgia', 'Armenia', 'Azerbaijan', 'Turkey'];
const sports = ['Soccer', 'Basketball', 'Ice Hockey'];
const defaultLeagueIds = ['4355', '4528', '4564'];

function iconForSport(sport: string): string {
  const name = sport.toLowerCase();
  if (name.includes('soccer') || name.includes('football')) return '⚽';
  if (name.includes('basket')) return '🏀';
  if (name.includes('hockey')) return '🏒';
  return '🏟️';
}

function cityFromEvent(event: SportsDbEvent, country: string): string {
  const venue = event.strVenue ?? '';
  if (venue.includes(',')) return venue.split(',').at(-1)?.trim() || country;
  return event.strHomeTeam?.split(' ').at(-1) ?? country;
}

function startsAt(event: SportsDbEvent): Date | null {
  const value =
    event.strTimestamp ?? `${event.dateEvent ?? ''}${event.strTime ? `T${event.strTime}` : ''}`;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`TheSportsDB responded with ${response.status}`);
  return (await response.json()) as T;
}

async function discoverLeagueIds(): Promise<string[]> {
  const ids = new Set<string>(defaultLeagueIds);
  for (const country of countries) {
    for (const sport of sports) {
      const url = `${env.CIS_SPORTS_API_URL}/search_all_leagues.php?c=${encodeURIComponent(
        country,
      )}&s=${encodeURIComponent(sport)}`;
      try {
        const payload = await fetchJson<{ countries?: SportsDbLeague[] }>(url);
        for (const league of payload.countries ?? []) {
          if (league.idLeague) ids.add(league.idLeague);
        }
      } catch {
        continue;
      }
    }
  }
  return [...ids].slice(0, 12);
}

async function fetchCisSportsEvents(): Promise<CisEventInput[]> {
  const leagueIds = await discoverLeagueIds();
  const events: CisEventInput[] = [];

  for (const leagueId of leagueIds) {
    try {
      const payload = await fetchJson<{ events?: SportsDbEvent[] }>(
        `${env.CIS_SPORTS_API_URL}/eventsnextleague.php?id=${leagueId}`,
      );
      for (const event of payload.events ?? []) {
        const date = startsAt(event);
        if (!event.idEvent || !event.strEvent || !date) continue;
        const country = event.strCountry ?? 'CIS';
        const sportName = event.strSport ?? 'Sport';
        const city = cityFromEvent(event, country);
        events.push({
          externalId: `thesportsdb-${event.idEvent}`,
          title: event.strEvent,
          description:
            event.strDescriptionEN ??
            `${event.strLeague ?? 'Sports event'} from TheSportsDB public API.`,
          sportName,
          sportIcon: iconForSport(sportName),
          venueName: event.strVenue || `${city} Arena`,
          city,
          address: event.strVenue || city,
          startsAt: date,
          source: 'TheSportsDB CIS API',
          sourceUrl: event.strPoster ?? event.strThumb ?? 'https://www.thesportsdb.com/',
          minPrice: sportName === 'Soccer' ? 35 : 28,
        });
      }
    } catch {
      continue;
    }
  }

  return events;
}

function uniqueEvents(events: CisEventInput[]): CisEventInput[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.externalId)) return false;
    seen.add(event.externalId);
    return true;
  });
}

export async function getCisSportsEventsPreview(): Promise<CisEventInput[]> {
  return uniqueEvents(await fetchCisSportsEvents());
}

async function importEvents(events: CisEventInput[]): Promise<CisImportResult> {
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
      where: { venueId_name: { venueId: venue.id, name: 'Main Stand' } },
      update: { rows: 10, seatsPerRow: 24 },
      create: { venueId: venue.id, name: 'Main Stand', rows: 10, seatsPerRow: 24 },
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
      where: { eventId_sectorId_name: { eventId: event.id, sectorId: sector.id, name: 'Standard' } },
      update: { price: eventData.minPrice },
      create: { eventId: event.id, sectorId: sector.id, name: 'Standard', price: eventData.minPrice },
    });
  }

  return { created, updated, skipped, events };
}

export async function importCisSportsEvents(): Promise<CisImportResult> {
  return importEvents(await getCisSportsEventsPreview());
}

export async function importSelectedCisSportsEvents(externalIds: string[]): Promise<CisImportResult> {
  const requested = new Set(externalIds);
  const events = (await getCisSportsEventsPreview()).filter((event) =>
    requested.has(event.externalId),
  );
  return importEvents(events);
}
