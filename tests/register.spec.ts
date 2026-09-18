import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'

import { LoginPage } from '../pages/login.page'
import { DashPage } from '../pages/dash.page'
import { RegisterPage } from '../pages/register.page'

import { Navbar } from '../pages/components/navbar'
import { Toast } from '../pages/components/toast'

import { Mission } from '../support/types'

import { cleanMission, cleanAndInsertMission } from '../support/db'

let loginPage: LoginPage
let dashPage: DashPage
let registerPage: RegisterPage
let navbar: Navbar
let toast: Toast

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  dashPage = new DashPage(page)
  registerPage = new RegisterPage(page)

  navbar = new Navbar(page)
  toast = new Toast(page)

  // Arrange - preparação do cenário
  await loginPage.go()
  await loginPage.login('buzz@lunarpass.dev', 'pwd123')
  await expect(navbar.logout).toBeVisible({ timeout: 10_000 })
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
  await registerPage.submit(mission)

  await expect(toast.message).toContainText('A nova missão foi adicionada ao catálogo e já está disponível para reservas.')
})

test('não deve cadastrar com código de missão incorreto', async ({ page }) => {

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
  await registerPage.submit(mission)

  await expect(registerPage.alert).toHaveText('Use o formato LP-0000')
})

test('não deve cadastrar com código duplicado', async ({ page }) => {
  // Arrange
  const mission: Mission = {
    id: 'LP-3001A',
    rocket: 'Starship',
    baseId: 'orion',
    departureDate: '2030-01-20',
    returnDate: '2030-01-27',
    price: 500.00
  }

  await cleanAndInsertMission(mission)

  // Act
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.submit(mission)

  // Assert
  await expect(registerPage.alert).toHaveText('Já existe uma missão com este ID.')
})