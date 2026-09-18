import { Page, Locator, expect } from '@playwright/test'

export class DashPage {
    readonly page: Page
    readonly addButton: Locator
    readonly search: Locator

    constructor(page: Page) {
        this.page = page
        this.addButton = page.getByRole('link', { name: 'Nova missão' })
        this.search = page.getByRole('textbox', { name: 'Buscar por ID ou foguete' })

    }

     async searchMission(mission: string) {
        await this.search.fill(mission)
        await this.search.press('Enter')
        await expect(this.page.getByTestId('mission-row')).toHaveCount(1)
        await expect(this.page.getByTestId('mission-row').filter({ hasText: mission })).toBeVisible()
    }
}