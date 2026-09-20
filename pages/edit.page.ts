import { Page, Locator } from '@playwright/test'

export class EditPage {
    readonly page: Page
    readonly heading: Locator
    readonly idInput: Locator
    readonly rocketInput: Locator
    readonly baseSelect: Locator
    readonly departureDateInput: Locator
    readonly returnDateView: Locator
    readonly priceInput: Locator
    readonly saveButton: Locator
    readonly backButton: Locator
    readonly alert: Locator
    readonly toast: Locator

    constructor(page: Page) {
        this.page = page
        this.heading = page.getByRole('heading', { level: 2 })
        this.idInput = page.locator('#mission-form-id')
        this.rocketInput = page.locator('#mission-form-rocket')
        this.baseSelect = page.locator('#mission-form-base')
        this.departureDateInput = page.locator('#mission-form-departure-date')
        this.returnDateView = page.getByTestId('mission-form-return-date')
        this.priceInput = page.locator('#mission-form-price')
        this.saveButton = page.getByRole('button', { name: 'Salvar missão' })
        this.backButton = page.getByRole('link', { name: 'Voltar' })
        this.alert = page.getByRole('alert')
        this.toast = page.getByRole('listitem')
    }

    async updateDetails(data: {
        rocket?: string
        baseId?: string
        departureDate?: string
        price?: number | string
    }) {
        if (data.rocket !== undefined) {
            await this.rocketInput.fill(data.rocket)
        }
        if (data.baseId !== undefined) {
            await this.baseSelect.selectOption(data.baseId)
        }
        if (data.departureDate !== undefined) {
            await this.departureDateInput.fill(data.departureDate)
        }
        if (data.price !== undefined) {
            await this.priceInput.fill(data.price.toString())
        }
    }

    async submit() {
        await this.saveButton.click()
    }

    async back() {
        await this.backButton.click()
    }
}
