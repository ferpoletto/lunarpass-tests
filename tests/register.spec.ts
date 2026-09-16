import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { Navbar } from '../pages/components/navbar'
import { faker } from '@faker-js/faker'
import { Mission } from '../support/mission'

let loginPage: LoginPage
let navbar: Navbar

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navbar = new Navbar(page)
    await loginPage.go()
})

test('deve cadastrar uma nova missão', async ({ page }) => {
    const mission: Mission = {
        id: 'LP-' + faker.string.alphanumeric({ length: { min: 5, max: 5 }, casing: 'upper' }),
        rocket: 'Starship',
        lunarBase: 'aurora',
        departureDate: '2028-01-20',
        price: '1000'
    }
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
    await expect(navbar.logoutButton).toBeVisible({ timeout: 5000 })

    await page.getByRole('link', { name: 'Nova missão' }).click()
    await expect(page.getByRole('heading', { name: 'Programar missão' })).toBeVisible()

    const missionId = 'LP-' + faker.string.alphanumeric({ length: { min: 5, max: 5 }, casing: 'upper' })

    await page.getByRole('textbox', { name: 'ID da missão' }).fill(mission.id)
    await page.getByRole('textbox', { name: 'Foguete' }).fill(mission.rocket)
    await page.getByLabel('Base lunar').selectOption(mission.lunarBase)
    await page.getByRole('textbox', { name: 'Data de partida' }).fill(mission.departureDate)
    await page.getByRole('spinbutton', { name: 'Preço por passagem (USD)' }).fill(mission.price.toString())
    await page.getByRole('button', { name: 'Salvar missão' }).click()
    await expect(page.getByRole('listitem')).toContainText('A nova missão foi adicionada ao catálogo e já está disponível para reservas.');
})