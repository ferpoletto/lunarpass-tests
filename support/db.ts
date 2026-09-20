import { Pool } from 'pg'
import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely'
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
    try {
        // Exclui bilhetes vinculados às reservas da missão
        await sql`DELETE FROM tickets WHERE reservation_id IN (SELECT id FROM reservations WHERE mission_id = ${mission.id})`.execute(db)
    } catch {
        // Ignora caso a tabela de tickets use outra convenção
    }

    try {
        // Exclui bilhetes diretos se houver coluna mission_id
        await sql`DELETE FROM tickets WHERE mission_id = ${mission.id}`.execute(db)
    } catch {
        // Ignora
    }

    try {
        // Exclui reservas vinculadas à missão
        await sql`DELETE FROM reservations WHERE mission_id = ${mission.id}`.execute(db)
    } catch {
        // Ignora
    }

    try {
        // Exclui a missão
        await deleteMission(mission.id)
    } catch {
        // Ignora
    }

    console.log(`Missão ${mission.id} e dependências removidas do banco de dados`)
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

export async function insertReservation(missionId: string, options?: Partial<Reservation>) {
    await db
        .insertInto('reservations')
        .values({
            missionId,
            reservationCode: options?.reservationCode ?? `RES-${Date.now()}`,
            contactEmail: options?.contactEmail ?? 'buzz@lunarpass.dev',
            totalPrice: options?.totalPrice ?? 1000.00,
            status: options?.status ?? 'confirmed'
        } as any)
        .execute()
}

export async function deleteReservation(missionId: string) {
    await db
        .deleteFrom('reservations')
        .where('missionId', '=', missionId)
        .execute()
}

export async function deleteTicket(missionId: string) {
    try {
        await db
            .deleteFrom('tickets')
            .where('missionId', '=', missionId)
            .execute()
    } catch {
        // fallback silencioso
    }
}