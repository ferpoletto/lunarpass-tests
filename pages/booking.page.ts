import { Page, Locator } from '@playwright/test'

export interface PassengerData {
    fullName: string
    passport: string
}

export interface PaymentData {
    contactEmail?: string
    cardName?: string
    cardNumber?: string
    expiry?: string
    cvv?: string
}

/**
 * Page Object para o fluxo de Reserva e Pagamento (/booking/:missionId)
 * Estruturado em 4 etapas:
 * 1. Assentos (Seleção de assentos no mapa da cabine)
 * 2. Passageiros (Cadastro de nome e passaporte por assento)
 * 3. Pagamento (Dados de contato, cartão e processamento via Stripe)
 * 4. Confirmação (Resumo da reserva, bilhetes e código localizador)
 */
export class BookingPage {
    readonly page: Page

    // Navegação geral e etapas
    readonly backLink: Locator
    readonly stepsNav: Locator

    // Resumo lateral (Aside)
    readonly summaryMissionCode: Locator
    readonly summaryRocket: Locator
    readonly summaryDestination: Locator
    readonly summaryDepartureDate: Locator
    readonly summaryReturnDate: Locator
    readonly summaryDuration: Locator
    readonly summarySelectedSeats: Locator
    readonly summaryUnitPrice: Locator
    readonly summaryTotalPrice: Locator

    // Etapa 1: Assentos
    readonly seatsHeading: Locator
    readonly soldOutHeading: Locator
    readonly seatMap: Locator
    readonly seatSelectionError: Locator
    readonly continueToPassengersButton: Locator

    // Etapa 2: Passageiros
    readonly passengersHeading: Locator
    readonly backToSeatsButton: Locator
    readonly continueToPaymentButton: Locator

    // Etapa 3: Pagamento
    readonly paymentHeading: Locator
    readonly contactEmailInput: Locator
    readonly contactEmailError: Locator
    readonly cardNameInput: Locator
    readonly cardNameError: Locator
    readonly cardNumberInput: Locator
    readonly cardNumberError: Locator
    readonly cardBrandBadge: Locator
    readonly expiryInput: Locator
    readonly expiryError: Locator
    readonly cvvInput: Locator
    readonly cvvError: Locator
    readonly backToPassengersButton: Locator
    readonly payButton: Locator
    readonly paymentAlert: Locator
    readonly processingStatus: Locator

    // Etapa 4: Confirmação
    readonly confirmationSection: Locator
    readonly confirmationHeading: Locator
    readonly reservationCode: Locator
    readonly reservationDestination: Locator
    readonly reservationDates: Locator
    readonly reservationDepartureDate: Locator
    readonly reservationReturnDate: Locator
    readonly reservationRocket: Locator
    readonly reservationSeats: Locator
    readonly reservationTotalPrice: Locator
    readonly reservationContactEmail: Locator
    readonly ticketItems: Locator
    readonly newMissionButton: Locator

    constructor(page: Page) {
        this.page = page

        // Navegação
        this.backLink = page.getByRole('link', { name: /Voltar às missões/i })
        this.stepsNav = page.locator('ol li')

        // Aside
        this.summaryMissionCode = page.getByTestId('summary-mission-code')
        this.summaryRocket = page.getByTestId('summary-rocket')
        this.summaryDestination = page.getByTestId('summary-destination')
        this.summaryDepartureDate = page.getByTestId('summary-departure-date')
        this.summaryReturnDate = page.getByTestId('summary-return-date')
        this.summaryDuration = page.getByTestId('summary-duration')
        this.summarySelectedSeats = page.getByTestId('summary-selected-seats')
        this.summaryUnitPrice = page.getByTestId('summary-unit-price')
        this.summaryTotalPrice = page.getByTestId('summary-total-price')

        // Etapa 1
        this.seatsHeading = page.getByRole('heading', { name: 'Escolha seus assentos' })
        this.soldOutHeading = page.getByRole('heading', { name: 'Missão esgotada' })
        this.seatMap = page.getByTestId('seat-map')
        this.seatSelectionError = page.locator('#seat-selection-error')
        this.continueToPassengersButton = page.getByRole('button', { name: 'Continuar' })

        // Etapa 2
        this.passengersHeading = page.getByRole('heading', { name: 'Cadastre os passageiros' })
        this.backToSeatsButton = page.getByRole('button', { name: 'Voltar' })
        this.continueToPaymentButton = page.getByRole('button', { name: 'Ir para pagamento' })

        // Etapa 3
        this.paymentHeading = page.getByRole('heading', { name: 'Pagamento' })
        this.contactEmailInput = page.locator('#payment-contactEmail')
        this.contactEmailError = page.locator('#payment-contactEmail-error')
        this.cardNameInput = page.locator('#payment-cardName')
        this.cardNameError = page.locator('#payment-cardName-error')
        this.cardNumberInput = page.locator('#payment-cardNumber')
        this.cardNumberError = page.locator('#payment-cardNumber-error')
        this.cardBrandBadge = page.locator('svg[aria-label^="Bandeira"]')
        this.expiryInput = page.locator('#payment-expiry')
        this.expiryError = page.locator('#payment-expiry-error')
        this.cvvInput = page.locator('#payment-cvv')
        this.cvvError = page.locator('#payment-cvv-error')
        this.backToPassengersButton = page.getByRole('button', { name: 'Voltar' })
        this.payButton = page.getByRole('button', { name: 'Pagar e reservar' })
        this.paymentAlert = page.getByRole('alert')
        this.processingStatus = page.getByRole('status')

        // Etapa 4
        this.confirmationSection = page.locator('section[data-testid="reservation-confirmation"]')
        this.confirmationHeading = page.getByRole('heading', { name: 'Sua reserva está confirmada.' })
        this.reservationCode = page.getByTestId('reservation-code')
        this.reservationDestination = page.getByTestId('reservation-destination')
        this.reservationDates = page.getByTestId('reservation-dates')
        this.reservationDepartureDate = page.getByTestId('reservation-departure-date')
        this.reservationReturnDate = page.getByTestId('reservation-return-date')
        this.reservationRocket = page.getByTestId('reservation-rocket')
        this.reservationSeats = page.getByTestId('reservation-seats')
        this.reservationTotalPrice = page.getByTestId('reservation-total-price')
        this.reservationContactEmail = page.getByTestId('reservation-contact-email')
        this.ticketItems = page.locator('li[data-testid="reservation-ticket"]')
        this.newMissionButton = page.getByRole('button', { name: 'Nova missão' })
    }

    async go(missionId: string) {
        await this.page.goto(`/booking/${missionId}`)
    }

    /**
     * Localizador dinâmico para assento específico da cabine
     */
    getSeat(seatId: 'A1' | 'A2' | 'B1' | 'B2') {
        return this.page.locator(`button[data-testid="seat"][data-seat="${seatId}"]`)
    }

    /**
     * Tooltip de informações de um assento
     */
    getSeatTooltip(seatId: string) {
        return this.page.locator(`[data-testid="seat-tooltip"][data-seat="${seatId}"]`)
    }

    /**
     * Alterna a seleção de um assento
     */
    async selectSeat(seatId: 'A1' | 'A2' | 'B1' | 'B2', options?: { force?: boolean }) {
        await this.getSeat(seatId).click(options)
    }

    /**
     * Campos de passageiro por assento
     */
    getPassengerCard(seatId: string) {
        return this.page.locator(`[data-testid="passenger-card"][data-seat="${seatId}"]`)
    }

    getPassengerFullNameInput(seatId: string) {
        return this.page.locator(`#passenger-${seatId}-fullName`)
    }

    getPassengerPassportInput(seatId: string) {
        return this.page.locator(`#passenger-${seatId}-passport`)
    }

    getPassengerFullNameError(seatId: string) {
        return this.page.locator(`#passenger-${seatId}-fullName-error`)
    }

    getPassengerPassportError(seatId: string) {
        return this.page.locator(`#passenger-${seatId}-passport-error`)
    }

    /**
     * Preenche os dados de um passageiro em um assento específico
     */
    async fillPassenger(seatId: string, data: PassengerData) {
        if (data.fullName !== undefined) {
            await this.getPassengerFullNameInput(seatId).fill(data.fullName)
        }
        if (data.passport !== undefined) {
            await this.getPassengerPassportInput(seatId).fill(data.passport)
        }
    }

    /**
     * Preenche o formulário de pagamento
     */
    async fillPayment(data: PaymentData) {
        if (data.contactEmail !== undefined) {
            await this.contactEmailInput.fill(data.contactEmail)
        }
        if (data.cardName !== undefined) {
            await this.cardNameInput.fill(data.cardName)
        }
        if (data.cardNumber !== undefined) {
            await this.cardNumberInput.fill(data.cardNumber)
        }
        if (data.expiry !== undefined) {
            await this.expiryInput.fill(data.expiry)
        }
        if (data.cvv !== undefined) {
            await this.cvvInput.fill(data.cvv)
        }
    }
}
