import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { Navbar } from '../pages/components/navbar'
import { faker } from '@faker-js/faker'
import { Mission } from '../support/types'
import { DashPage } from '../pages/dash.page'
import { RegisterPage } from '../pages/register.page'
import { Toasty } from '../pages/components/toasty'
import { insertMission, cleanMission, cleanAndInsertMission } from '../support/db'


let loginPage: LoginPage
let navbar: Navbar
let dashPage: DashPage
let toasty: Toasty
let registerPage: RegisterPage

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navbar = new Navbar(page)
    dashPage = new DashPage(page)
    toasty = new Toasty(page)
    registerPage = new RegisterPage(page)
    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
})

test('deve cadastrar uma nova missão', async ({ page }) => {
    const mission: Mission = {
        id: 'LP-0128A',
        rocket: 'Starship',
        baseId: 'aurora',
        departureDate: '2028-01-20',
        returnDate: '2028-01-27',
        price: 1000.00
    }

    await cleanMission(mission)

    await dashPage.addButton.click()
    await expect(registerPage.title).toBeVisible()

    await registerPage.submitMission(mission)
    await expect(toasty.message).toContainText('A nova missão foi adicionada ao catálogo e já está disponível para reservas.');
})

test('não deve cadastrar missão com ID fora do padrão', async ({ page }) => {
    const mission: Mission = {
        id: faker.string.alphanumeric({ length: { min: 5, max: 5 }, casing: 'upper' }),
        rocket: 'Starship',
        baseId: 'aurora',
        departureDate: '2028-01-20',
        returnDate: '2028-01-27',
        price: 1000.00
    }

    await dashPage.addButton.click()
    await expect(registerPage.title).toBeVisible()

    await registerPage.submitMission(mission)
    await expect(registerPage.alert).toContainText('Use o formato LP-0000')
})

test('não deve cadastrar missão com código duplicado', async ({ page }) => {
    const mission: Mission = {
        id: 'LP-DUPY1',
        rocket: 'Starship',
        baseId: 'aurora',
        departureDate: '2028-01-20',
        returnDate: '2028-01-27',
        price: 1000.00
    }

    await cleanAndInsertMission(mission)

    await dashPage.addButton.click()
    await expect(registerPage.title).toBeVisible()

    await registerPage.submitMission(mission)
    await expect(registerPage.alert).toContainText('Já existe uma missão com este ID.')
})