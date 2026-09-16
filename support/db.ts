import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

interface Database {
    missions: {
        id: string,
        rocket: string,
        base_id: string,
        departure_date: string,
        return_date: string,
        price: number
    },

    reservations: {
        mission_id: string,

    },
    tickets: {
        mission_id: string,
    }
}

const dialect = new PostgresDialect({
    pool: new Pool({
        /* host: 'db.gubfhbrvhplijcpweemv.supabase.co',
        database: 'postgres',
        user: 'postgres',
        password: 'GFvyUN7h9NRZYkHF',
        port: 5432,
        max:10, */
        connectionString: 'postgresql://postgres:ST1kkFLkAioVZNPa@db.gubfhbrvhplijcpweemv.supabase.co:5432/postgres',
        ssl: { rejectUnauthorized: false }
    })
})

export const db = new Kysely<Database>({
    dialect,
})

export async function insertMission(id: string) {
    await db
        .insertInto('missions')
        .values({
            id: id,
            rocket: 'Starship',
            base_id: 'aurora',
            departure_date: '2028-01-20',
            return_date: '2028-01-27',
            price: 1000.00
        })
        .execute()
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

export async function deleteTickets(mission_id: string) {
    await db
        .deleteFrom('tickets')
        .where('mission_id', '=', mission_id)
        .execute()
}