import { Page, Locator, expect } from '@playwright/test'
import { Mission } from '../support/types'
import { formatDate } from '../support/helpers'

export class RegisterPage {
    readonly page: Page
    readonly title: Locator
    readonly idInput: Locator
    readonly rocketInput: Locator
    readonly baseSelect: Locator
    readonly departureDateInput: Locator
    readonly returnDateDisplay: Locator
    readonly priceInput: Locator
    readonly saveButton: Locator
    readonly backLink: Locator
    readonly alert: Locator

    constructor(page: Page) {
        this.page = page
        this.title = page.getByRole('heading', { name: 'Programar missão' })
        this.idInput = page.locator('#mission-form-id')
        this.rocketInput = page.locator('#mission-form-rocket')
        this.baseSelect = page.locator('#mission-form-base')
        this.departureDateInput = page.locator('#mission-form-departure-date')
        this.returnDateDisplay = page.getByTestId('mission-form-return-date')
        this.priceInput = page.locator('#mission-form-price')
        this.saveButton = page.getByRole('button', { name: 'Salvar missão' })
        this.backLink = page.getByRole('link', { name: 'Voltar' })
        this.alert = page.getByRole('alert')
    }

    async go() {
        await this.page.goto('/mission-control/new')
    }

    async fillForm(mission: Partial<Mission>) {
        if (mission.id !== undefined) {
            await this.idInput.fill(mission.id)
        }
        if (mission.rocket !== undefined) {
            await this.rocketInput.fill(mission.rocket)
        }
        if (mission.baseId !== undefined) {
            await this.baseSelect.selectOption(mission.baseId)
        }
        if (mission.departureDate !== undefined) {
            await this.departureDateInput.fill(mission.departureDate)
        }
        if (mission.price !== undefined) {
            await this.priceInput.fill(mission.price.toString())
        }
    }

    async submit(mission: Mission) {
        await this.fillForm(mission)
        if (mission.returnDate) {
            await expect(this.returnDateDisplay).toContainText(formatDate(mission.returnDate))
        }
        await this.saveButton.click()
    }
}