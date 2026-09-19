import { Page, Locator, expect } from '@playwright/test'
import { Mission } from '../support/types'
import { formatDate } from '../support/helpers'

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

    getRow(id: string): Locator {
        return this.page.getByTestId('mission-row').filter({ hasText: id })
    }

    getEditButton(id: string): Locator {
        return this.getRow(id).getByRole('link', { name: `Editar ${id}` })
    }

    getDeleteButton(id: string): Locator {
        return this.getRow(id).getByRole('button', { name: `Excluir ${id}` })
    }

    async validateMissionRow(mission: Mission) {
        const row = this.getRow(mission.id)

        await expect(row.getByText(mission.id)).toBeVisible()
        await expect(row.getByText(mission.rocket)).toBeVisible()

        const baseFormatted = mission.baseId.charAt(0).toUpperCase() + mission.baseId.slice(1)
        await expect(row.getByText(`Base ${baseFormatted}`)).toBeVisible()

        const dateRange = `${formatDate(mission.departureDate)} → ${formatDate(mission.returnDate)}`
        await expect(row.getByText(dateRange)).toBeVisible()

        const priceFormatted = mission.price.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'code'
        })
        await expect(row.getByText(priceFormatted)).toBeVisible()

        await expect(this.getEditButton(mission.id)).toBeVisible()
        await expect(this.getDeleteButton(mission.id)).toBeVisible()
    }
}
