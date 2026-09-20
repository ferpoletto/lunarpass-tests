import { Page, Locator, expect } from '@playwright/test'
import { Mission } from '../support/types'
import { formatDate } from '../support/helpers'

export class DashPage {
    readonly page: Page
    readonly table: Locator
    readonly addButton: Locator
    readonly searchInput: Locator
    readonly rows: Locator
    readonly emptyState: Locator
    readonly toast: Locator

    // Modal de confirmação de exclusão
    readonly confirmModal: Locator
    readonly confirmModalHeading: Locator
    readonly confirmModalAlert: Locator
    readonly confirmDeleteButton: Locator
    readonly cancelDeleteButton: Locator

    constructor(page: Page) {
        this.page = page
        this.table = page.locator('table')
        this.addButton = page.getByRole('link', { name: 'Nova missão' })
        this.searchInput = page.getByRole('textbox', { name: 'Buscar por ID ou foguete' })
        this.rows = page.getByTestId('mission-row')
        this.emptyState = page.getByText('Nenhuma missão encontrada com esses filtros.')
        this.toast = page.getByRole('listitem')

        this.confirmModal = page.getByRole('alertdialog')
        this.confirmModalHeading = page.getByText('Confirmação necessária')
        this.confirmModalAlert = this.confirmModal.getByRole('alert')
        this.confirmDeleteButton = page.getByRole('button', { name: 'Excluir missão' })
        this.cancelDeleteButton = page.getByRole('button', { name: 'Cancelar' })
    }

    async search(query: string) {
        await this.searchInput.fill(query)
        await this.searchInput.press('Enter')
    }

    async searchBy(query: string) {
        await this.search(query)
    }

    async searchMission(mission: string) {
        await this.search(mission)
        await expect(this.rows).toHaveCount(1)
        await expect(this.rows.filter({ hasText: mission })).toBeVisible()
    }

    getRow(id: string): Locator {
        return this.rows.filter({ hasText: id })
    }

    getEditButton(id: string): Locator {
        return this.getRow(id).getByRole('link', { name: `Editar ${id}` })
    }

    getDeleteButton(id: string): Locator {
        return this.getRow(id).getByRole('button', { name: `Excluir ${id}` })
    }

    async requestDelete(id: string) {
        await this.getDeleteButton(id).click()
    }

    async confirmDelete() {
        await this.confirmDeleteButton.click()
    }

    async cancelDelete() {
        await this.cancelDeleteButton.click()
    }

    async deleteMission(id: string) {
        await this.requestDelete(id)
        await this.confirmDelete()
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
