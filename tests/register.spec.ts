import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { Navbar } from '../pages/components/navbar'

import {faker} from '@faker-js/faker'


let loginPage: LoginPage
let navbar: Navbar

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navbar = new Navbar(page)
    await loginPage.go()
    
})

test('deve cadastrar uma nova missão', async ({ page }) => {
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
    await expect(navbar.logoutButton).toBeVisible({timeout: 5000})

    await page.getByRole('link', { name: 'Nova missão' }).click()
    await expect(page.getByRole('heading', { name: 'Programar missão' })).toBeVisible()

    const missionId = 'LP-'+ faker.string.alphanumeric({length: { min: 5, max: 5 }, casing: 'upper'})

    await page.getByRole('textbox', { name: 'ID da missão' }).fill(missionId)
    await page.getByRole('textbox', { name: 'Foguete' }).fill('Starship')
    await page.getByLabel('Base lunar').selectOption('aurora')
    await page.getByRole('textbox', { name: 'Data de partida' }).fill('2028-01-20')
    await expect(page.getByTestId('mission-form-return-date')).toContainText('27 de jan. de 2028')
    await page.getByRole('spinbutton', { name: 'Preço por passagem (USD)' }).fill('1000')
    await page.getByRole('button', { name: 'Salvar missão' }).click()
    await expect(page.getByRole('listitem')).toContainText('A nova missão foi adicionada ao catálogo e já está disponível para reservas.');
})