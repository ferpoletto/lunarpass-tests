import { Page, Locator } from '@playwright/test'

/**
 * Page Object para a Landing Page (/) e o Catálogo de Missões (/missions)
 */
export class HomePage {
    readonly page: Page

    // Header
    readonly navMissionsLink: Locator
    readonly navBasesLink: Locator

    // Hero Section
    readonly slogan: Locator
    readonly subtitle: Locator
    readonly baseFilter: Locator
    readonly homeSortSelect: Locator
    readonly searchMissionsButton: Locator

    // Catálogo de Missões (/missions)
    readonly resultsHeading: Locator
    readonly missionCards: Locator
    readonly emptyState: Locator
    readonly refineButton: Locator
    readonly baseSelectButton: Locator

    constructor(page: Page) {
        this.page = page

        // Header
        this.navMissionsLink = page.getByRole('link', { name: 'Missões', exact: true })
        this.navBasesLink = page.getByRole('link', { name: 'Bases', exact: true })

        // Hero
        this.slogan = page.getByRole('heading', { name: 'Sua viagem para a Lua começa aqui.' })
        this.subtitle = page.getByText('Sua próxima grande história começa na Lua.')
        this.baseFilter = page.getByTestId('base-filter')
        this.homeSortSelect = page.locator('#home-mission-sort')
        this.searchMissionsButton = page.getByRole('button', { name: /Buscar missões/i })

        // Catálogo (/missions)
        this.resultsHeading = page.locator('h1:has-text("disponív")')
        this.missionCards = page.getByTestId('mission-card')
        this.emptyState = page.getByTestId('missions-empty-state')
        this.refineButton = page.getByRole('button', { name: /Refinar/i })
        this.baseSelectButton = page.locator('#missions-base')
    }

    async go() {
        await this.page.goto('/')
    }

    async goMissions() {
        await this.page.goto('/missions')
    }

    getBaseCheckbox(baseId: 'alpha' | 'orion' | 'aurora' | 'selene') {
        return this.page.locator(`#base-${baseId}`)
    }

    getMissionCard(missionId: string) {
        return this.page.locator(`[data-testid="mission-card"][data-mission-code="${missionId}"]`)
    }

    getBaseCardLink(baseId: 'alpha' | 'orion' | 'aurora' | 'selene') {
        return this.page.locator(`a[href*="base=${baseId}"]`)
    }
}
