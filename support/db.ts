import { Pool } from 'pg'
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely'
import { Mission, Ticket, Reservation } from './types'

interface Database {
    missions: Mission,
    reservations: Reservation,
    tickets: Ticket
}

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: 'postgresql://postgres.gubfhbrvhplijcpweemv:3KvWaSZGIOabLEU8@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }

    })
})

export const db = new Kysely<Database>({
    dialect,
    plugins: [new CamelCasePlugin()]
})

export async function cleanAndInsertMission(mission: Mission) {
    await cleanMission(mission)
    await insertMission(mission)
}

export async function cleanMission(mission: Mission) {
    await deleteReservation(mission.id)
    await deleteTicket(mission.id)
    await deleteMission(mission.id)
    console.log(`Missão ${mission.id} removida do banco de dados`)
}

export async function insertMission(mission: Mission) {
    await db
        .insertInto('missions')
        .values(mission)
        .execute()
}

export async function deleteMission(id: string) {
    await db
        .deleteFrom('missions')
        .where('id', '=', id)
        .execute()
}

export async function deleteReservation(missionId: string) {
    await db
        .deleteFrom('reservations')
        .where('missionId', '=', missionId)
        .execute()
}

export async function deleteTicket(missionId: string) {
    await db
        .deleteFrom('tickets')
        .where('missionId', '=', missionId)
        .execute()
}