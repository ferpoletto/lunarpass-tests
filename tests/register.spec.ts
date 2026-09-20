import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'

import { LoginPage } from '../pages/login.page'
import { DashPage } from '../pages/dash.page'
import { RegisterPage } from '../pages/register.page'
import { Navbar } from '../pages/components/navbar'
import { Toasty } from '../pages/components/toasty'
import { Mission } from '../support/types'
import { cleanMission, cleanAndInsertMission } from '../support/db'
import { formatDate } from '../support/helpers'

/**
 * Suite de Testes: Cadastro e Programação de Missões (/mission-control/new)
 * 
 * Aborda cenários positivos, validações de schema (ID, foguete, data, preço),
 * cálculo automático de data de retorno, duplicidade no banco e navegação/cancelamento.
 */
let loginPage: LoginPage
let dashPage: DashPage
let registerPage: RegisterPage
let navbar: Navbar
let toasty: Toasty
let createdMission: Mission | null = null

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  dashPage = new DashPage(page)
  registerPage = new RegisterPage(page)
  navbar = new Navbar(page)
  toasty = new Toasty(page)
  createdMission = null

  // Arrange global: Efetua login administrativo no Mission Control
  await loginPage.go()
  await loginPage.login('buzz@lunarpass.dev', 'pwd123')
  await expect(navbar.logoutButton).toBeVisible({ timeout: 15_000 })
})

test.afterEach(async () => {
  // Teardown: Garante a limpeza de qualquer massa criada pelo teste, mesmo em caso de falha
  if (createdMission) {
    await cleanMission(createdMission)
    createdMission = null
  }
})

test('deve cadastrar uma nova missão com sucesso', async ({ page }) => {
  // Arrange: Prepara os dados da nova missão
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Falcon Heavy X',
    baseId: 'aurora',
    departureDate: '2028-05-10',
    returnDate: '2028-05-17',
    price: 320000.00
  }
  createdMission = mission
  await cleanMission(mission)

  // Act: Acessa o formulário de cadastro e submete os dados
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.submit(mission)

  // Assert: Valida mensagem de sucesso via Toast e redirecionamento para o Dashboard
  await expect(toasty.message).toContainText('A nova missão foi adicionada ao catálogo e já está disponível para reservas.')
  await page.waitForURL('**/mission-control')
})

test('não deve cadastrar com código de missão em formato inválido', async ({ page }) => {
  // Arrange: Missão com formato fora do padrão LP-XXXX
  const mission: Mission = {
    id: 'INVALID-99',
    rocket: 'Starship',
    baseId: 'aurora',
    departureDate: '2028-01-20',
    returnDate: '2028-01-27',
    price: 1000.00
  }

  // Act: Tenta submeter o cadastro com código inválido
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.fillForm(mission)
  await registerPage.saveButton.click()

  // Assert: Valida exibição da mensagem de validação do formato do ID
  await expect(registerPage.alert).toHaveText('Use o formato LP-0000')
})

test('não deve cadastrar com código de missão duplicado', async ({ page }) => {
  // Arrange: Insere previamente uma missão existente na base
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship Nova',
    baseId: 'orion',
    departureDate: '2030-01-20',
    returnDate: '2030-01-27',
    price: 500000.00
  }
  createdMission = mission
  await cleanAndInsertMission(mission)

  // Act: Tenta cadastrar novamente com o mesmo ID
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.fillForm(mission)
  await registerPage.saveButton.click()

  // Assert: Mensagem de erro informando duplicidade
  await expect(registerPage.alert).toHaveText('Já existe uma missão com este ID.')
})

test('não deve permitir cadastrar sem informar o nome do foguete', async ({ page }) => {
  // Arrange: Missão sem preencher o nome do foguete
  const mission: Partial<Mission> = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: '',
    baseId: 'alpha',
    departureDate: '2028-03-15',
    price: 250000.00
  }

  // Act: Submete o formulário com o campo foguete em branco
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.fillForm(mission)
  await registerPage.saveButton.click()

  // Assert: Validação de campo obrigatório para o foguete
  await expect(registerPage.alert).toHaveText('Informe o foguete')
})

test('não deve permitir cadastrar sem data de partida válida', async ({ page }) => {
  // Arrange: Missão com data de partida não informada
  const mission: Partial<Mission> = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship Prime',
    baseId: 'selene',
    price: 400000.00
  }

  // Act: Submete sem selecionar a data de partida
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.fillForm(mission)
  await registerPage.saveButton.click()

  // Assert: Validação de campo de data obrigatório
  await expect(registerPage.alert).toHaveText('Informe uma data válida')
})

test('não deve permitir cadastrar com preço zerado ou negativo', async ({ page }) => {
  // Arrange: Missão com preço 0
  const mission: Partial<Mission> = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship Prime',
    baseId: 'selene',
    departureDate: '2028-06-01',
    price: 0
  }

  // Act: Tenta salvar com valor zerado
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.fillForm(mission)
  await registerPage.saveButton.click()

  // Assert: Validação de preço mínimo (0.01)
  await expect(registerPage.alert).toHaveText('Informe um preço válido')
})

test('deve calcular a data de retorno automaticamente ao informar partida (+ 7 dias)', async ({ page }) => {
  // Arrange: Data de partida conhecida
  const departureDate = '2028-09-10'
  const expectedReturnDate = '2028-09-17'

  // Act: Preenche a data de partida no formulário
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.departureDateInput.fill(departureDate)

  // Assert: Verifica se o retorno automático exibiu a data formatada de +7 dias
  await expect(registerPage.returnDateDisplay).toContainText(formatDate(expectedReturnDate))
})

test('deve cancelar o cadastro e retornar para a listagem sem salvar', async ({ page }) => {
  // Act: Clica em "Voltar" na tela de cadastro
  await dashPage.addButton.click()
  await expect(registerPage.title).toBeVisible()
  await registerPage.backLink.click()

  // Assert: Redirecionado de volta para /mission-control
  await page.waitForURL('**/mission-control')
  await expect(dashPage.table).toBeVisible()
})