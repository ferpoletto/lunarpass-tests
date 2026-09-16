import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

interface Database {
    missions: {
        id: string
        rocket: string
        base_id: string
        departure_date: string
        return_date: string
        price: number
    },

    reservations: {
        mission_id: string

    },

    tickets: {
        mission_id: string

    }
}

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: 'postgresql://postgres.gubfhbrvhplijcpweemv:3KvWaSZGIOabLEU8@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }

    })
})

export const db = new Kysely<Database>({
    dialect,
})

export async function insertMission(id: string) {
    await db
        .insertInto('missions').values({
            id,
            rocket: 'Starship',
            base_id: 'aurora',
            departure_date: '2028-01-20',
            return_date: '2028-01-27',
            price: 1000.00
        }).execute()
}

export async function deleteMission(id: string) {
    await db
        .deleteFrom('missions')
        .where('id', '=', id)
        .execute()
}

export async function deleteReservation(mission_id: string) {
    await db
        .deleteFrom('reservations')
        .where('mission_id', '=', mission_id)
        .execute()
}

export async function deleteTicket(mission_id: string) {
    await db
        .deleteFrom('tickets')
        .where('mission_id', '=', mission_id)
        .execute()
}