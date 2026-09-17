import {Page, Locator, expect} from '@playwright/test';
import { Mission } from '../support/types';
import { formatDate } from '../support/helpers';

export class RegisterPage {
    readonly page: Page
    readonly missionIdInput: Locator
    readonly rocketInput: Locator
    readonly lunarBaseSelect: Locator
    readonly departureDateInput: Locator
    readonly priceInput: Locator
    readonly saveButton: Locator
    readonly title: Locator
    readonly alert: Locator

    
    constructor(page: Page) {
        this.page = page
        this.missionIdInput = page.getByRole('textbox', { name: 'ID da missão' })
        this.rocketInput = page.getByRole('textbox', { name: 'Foguete' })
        this.lunarBaseSelect = page.getByLabel('Base lunar')
        this.departureDateInput = page.getByRole('textbox', { name: 'Data de partida' })
        this.priceInput = page.getByRole('spinbutton', { name: 'Preço por passagem (USD)' })
        this.saveButton = page.getByRole('button', { name: 'Salvar missão' })
        this.title = page.getByRole('heading', { name: 'Programar missão' })
        this.alert = page.getByRole('alert')
    }

    async submitMission(mission: Mission) {
        await this.page.getByRole('textbox', { name: 'ID da missão' }).fill(mission.id)
        await this.page.getByRole('textbox', { name: 'Foguete' }).fill(mission.rocket)
        await this.page.getByLabel('Base lunar').selectOption(mission.baseId)
        await this.page.getByRole('textbox', { name: 'Data de partida' }).fill(mission.departureDate)
        await expect(this.page.getByTestId('mission-form-return-date')).toContainText(formatDate(mission.returnDate))
        await this.page.getByRole('spinbutton', { name: 'Preço por passagem (USD)' }).fill(mission.price.toString())
        await this.saveButton.click()
    }

}