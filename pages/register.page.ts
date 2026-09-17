import {Page, Locator, expect} from '@playwright/test';
import { Mission } from '../support/types';

function formatDate(dateString: string): string {
    const months = [
        'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
        'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'
    ];

    const [year, month, day] = dateString.split('-').map(Number);

    if (!year || !month || !day || month < 1 || month > 12) {
        throw new Error(`Invalid date format: "${dateString}". Expected AAAA-MM-DD.`);
    }

    const dayNumber = parseInt(String(day), 10); // removes leading zero, e.g. "05" -> 5
    const monthName = months[month - 1];

    return `${dayNumber} de ${monthName} de ${year}`;
}


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