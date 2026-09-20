export interface Mission {
    id: string
    rocket: string
    baseId: string
    departureDate: string
    returnDate: string
    price: number
}

export interface Reservation {
    id?: string
    userId?: string
    missionId: string
    reservationCode?: string
    contactEmail?: string
    totalPrice?: number
    status?: string
}


export interface Ticket {
    missionId: string
}