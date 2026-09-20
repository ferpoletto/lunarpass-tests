import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'

import { BookingPage } from '../pages/booking.page'
import { Mission } from '../support/types'
import { cleanAndInsertMission, cleanMission } from '../support/db'

/**
 * Suite de Testes: Reserva e Pagamento (/booking/:missionId)
 * 
 * Cobre todo o ciclo de vida da jornada do passageiro lunar:
 * 1. Happy Path completo (Seleção de assentos -> Passageiros -> Pagamento -> Confirmação)
 * 2. Validações de campos e regras de negócio na etapa de passageiros
 * 3. Validações de máscara e schema na etapa de pagamento
 * 4. Identificação dinâmica de bandeiras de cartão (Visa, Mastercard, Amex)
 * 5. Navegação bidirecional entre etapas com persistência de estado
 * 6. Tratamento de assento ocupado
 * 7. Exibição de tela de missão esgotada quando não há vagas
 */
let bookingPage: BookingPage
let testMission: Mission | null = null

test.beforeEach(async ({ page }) => {
  bookingPage = new BookingPage(page)
  testMission = null
})

test.afterEach(async () => {
  // Teardown: Remove a missão e suas reservas e bilhetes vinculados do banco de dados
  if (testMission) {
    await cleanMission(testMission)
    testMission = null
  }
})

test('deve completar o fluxo de reserva e pagamento com sucesso (happy path)', async ({ page }) => {
  // Arrange: Cria uma missão limpa para a reserva
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship Orbital',
    baseId: 'aurora',
    departureDate: '2028-11-15',
    returnDate: '2028-11-22',
    price: 350000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Act - Etapa 1: Acessa a página de reservas da missão
  await bookingPage.go(mission.id)
  await expect(bookingPage.seatsHeading).toBeVisible()

  // Valida dados iniciais no sumário lateral
  await expect(bookingPage.summaryMissionCode).toHaveText(mission.id)
  await expect(bookingPage.summaryRocket).toHaveText(mission.rocket)
  await expect(bookingPage.summaryDestination).toHaveText('Base Lunar Aurora')
  await expect(bookingPage.summarySelectedSeats).toHaveText('—')

  // Seleciona os assentos A1 e B2
  await expect(bookingPage.seatMap).toHaveAttribute('data-loading', 'false')
  await bookingPage.selectSeat('A1')
  await expect(bookingPage.getSeat('A1')).toHaveAttribute('data-seat-state', 'selected')
  await bookingPage.selectSeat('B2')
  await expect(bookingPage.getSeat('B2')).toHaveAttribute('data-seat-state', 'selected')

  // Valida atualização reativa do sumário (2 assentos = 2 * 350.000 = 700.000)
  await expect(bookingPage.summarySelectedSeats).toHaveText('A1 · B2')
  await expect(bookingPage.summaryTotalPrice).toContainText('700,000.00')

  // Avança para a Etapa 2: Passageiros
  await bookingPage.continueToPassengersButton.click()
  await expect(bookingPage.passengersHeading).toBeVisible()

  // Act - Etapa 2: Preenche os dados dos passageiros para os assentos A1 e B2
  await bookingPage.fillPassenger('A1', {
    fullName: 'Neil Armstrong',
    passport: 'US-APOLLO11'
  })
  await bookingPage.fillPassenger('B2', {
    fullName: 'Buzz Aldrin',
    passport: 'US-APOLLO12'
  })

  // Avança para a Etapa 3: Pagamento
  await bookingPage.continueToPaymentButton.click()
  await expect(bookingPage.paymentHeading).toBeVisible()

  // Act - Etapa 3: Preenche dados válidos de pagamento (cartão de testes Visa)
  await bookingPage.fillPayment({
    contactEmail: 'buzz@lunarpass.dev',
    cardName: 'Buzz Aldrin',
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/29',
    cvv: '999'
  })

  // Valida se a bandeira Visa foi identificada
  await expect(bookingPage.cardBrandBadge).toHaveAttribute('aria-label', /Bandeira Visa/i)

  // Submete o pagamento
  await bookingPage.payButton.click()

  // Assert - Etapa 4: Valida a tela de confirmação da reserva
  await expect(bookingPage.confirmationSection).toBeVisible({ timeout: 15_000 })
  await expect(bookingPage.confirmationHeading).toBeVisible()
  await expect(bookingPage.reservationCode).not.toBeEmpty()
  await expect(bookingPage.reservationDestination).toHaveText('Base Lunar Aurora')
  await expect(bookingPage.reservationRocket).toHaveText(mission.rocket)
  await expect(bookingPage.reservationSeats).toHaveText('A1 · B2')
  await expect(bookingPage.reservationTotalPrice).toContainText('700,000.00')
  await expect(bookingPage.reservationContactEmail).toHaveText('buzz@lunarpass.dev')

  // Valida se os bilhetes dos dois passageiros constam na lista
  await expect(bookingPage.ticketItems).toHaveCount(2)
  await expect(page.locator('li[data-seat="A1"]')).toContainText('Neil Armstrong')
  await expect(page.locator('li[data-seat="B2"]')).toContainText('Buzz Aldrin')

  // Clica no botão "Nova missão" e valida retorno à home
  await bookingPage.newMissionButton.click()
  await page.waitForURL('http://localhost:3000/')
})

test('deve validar campos obrigatórios e tamanhos mínimos na etapa de passageiros', async ({ page }) => {
  // Arrange: Cria missão de teste
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Falcon Heavy',
    baseId: 'alpha',
    departureDate: '2028-10-01',
    returnDate: '2028-10-08',
    price: 200000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Act: Seleciona um assento e avança para a etapa de passageiros
  await bookingPage.go(mission.id)
  await bookingPage.selectSeat('A1')
  await bookingPage.continueToPassengersButton.click()
  await expect(bookingPage.passengersHeading).toBeVisible()

  // Tenta avançar sem preencher nenhum dado
  await bookingPage.continueToPaymentButton.click()

  // Assert: Mensagens de obrigatoriedade
  await expect(bookingPage.getPassengerFullNameError('A1')).toHaveText('Informe o nome completo')
  await expect(bookingPage.getPassengerPassportError('A1')).toHaveText('Informe o passaporte')

  // Act: Preenche com dados abaixo do tamanho mínimo (nome < 3, passaporte < 5)
  await bookingPage.fillPassenger('A1', {
    fullName: 'Al',
    passport: '123'
  })
  await bookingPage.continueToPaymentButton.click()

  // Assert: Mensagens de validação de tamanho mínimo
  await expect(bookingPage.getPassengerFullNameError('A1')).toHaveText('O nome deve ter pelo menos 3 caracteres')
  await expect(bookingPage.getPassengerPassportError('A1')).toHaveText('O passaporte deve ter pelo menos 5 caracteres')
})

test('deve validar formatos e campos obrigatórios na etapa de pagamento', async ({ page }) => {
  // Arrange: Cria missão de teste
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Falcon Heavy',
    baseId: 'alpha',
    departureDate: '2028-10-01',
    returnDate: '2028-10-08',
    price: 200000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Act: Seleciona assento e preenche passageiro para chegar na etapa de pagamento
  await bookingPage.go(mission.id)
  await bookingPage.selectSeat('A1')
  await bookingPage.continueToPassengersButton.click()
  await bookingPage.fillPassenger('A1', {
    fullName: 'Gene Cernan',
    passport: 'US-APOLLO17'
  })
  await bookingPage.continueToPaymentButton.click()
  await expect(bookingPage.paymentHeading).toBeVisible()

  // Preenche dados inválidos no pagamento
  await bookingPage.fillPayment({
    contactEmail: 'email-invalido',
    cardName: 'G',
    cardNumber: '1234',
    expiry: '13/30',
    cvv: '1'
  })
  await bookingPage.payButton.click()

  // Assert: Valida as mensagens de erro em todos os campos do cartão
  await expect(bookingPage.contactEmailError).toHaveText('E-mail de contato inválido')
  await expect(bookingPage.cardNameError).toHaveText('O nome no cartão deve ter pelo menos 3 caracteres')
  await expect(bookingPage.cardNumberError).toHaveText('Número de cartão inválido')
  await expect(bookingPage.expiryError).toHaveText('Validade MM/AA')
  await expect(bookingPage.cvvError).toHaveText('CVV inválido')
})

test('deve detectar dinamicamente as bandeiras Visa, Mastercard e American Express', async ({ page }) => {
  // Arrange: Cria missão de teste
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship One',
    baseId: 'selene',
    departureDate: '2029-02-01',
    returnDate: '2029-02-08',
    price: 450000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Act: Avança até a tela de pagamento
  await bookingPage.go(mission.id)
  await bookingPage.selectSeat('B1')
  await bookingPage.continueToPassengersButton.click()
  await bookingPage.fillPassenger('B1', {
    fullName: 'Alan Shepard',
    passport: 'US-MERCURY'
  })
  await bookingPage.continueToPaymentButton.click()

  // Assert 1: Testa prefixo Visa (iniciado com 4)
  await bookingPage.cardNumberInput.fill('4111 1111 1111 1111')
  await expect(bookingPage.cardBrandBadge).toHaveAttribute('aria-label', /Bandeira Visa/i)

  // Assert 2: Testa prefixo Mastercard (iniciado com 55)
  await bookingPage.cardNumberInput.fill('5555 5555 5555 5555')
  await expect(bookingPage.cardBrandBadge).toHaveAttribute('aria-label', /Bandeira Mastercard/i)

  // Assert 3: Testa prefixo American Express (iniciado com 34 ou 37)
  await bookingPage.cardNumberInput.fill('3782 8224 6310 005')
  await expect(bookingPage.cardBrandBadge).toHaveAttribute('aria-label', /Bandeira American Express/i)
})

test('deve permitir navegação bidirecional entre etapas preservando os dados', async ({ page }) => {
  // Arrange: Cria missão de teste
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Starship Navigator',
    baseId: 'orion',
    departureDate: '2029-03-01',
    returnDate: '2029-03-08',
    price: 300000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Act 1: Seleciona assento A2 e vai para passageiros
  await bookingPage.go(mission.id)
  await expect(bookingPage.seatMap).toHaveAttribute('data-loading', 'false')
  await bookingPage.selectSeat('A2')
  await expect(bookingPage.getSeat('A2')).toHaveAttribute('data-seat-state', 'selected')
  await bookingPage.continueToPassengersButton.click()
  await expect(bookingPage.passengersHeading).toBeVisible()

  // Act 2: Clica em Voltar para conferir se assento continua selecionado
  await bookingPage.backToSeatsButton.click()
  await expect(bookingPage.seatsHeading).toBeVisible()
  await expect(bookingPage.getSeat('A2')).toHaveAttribute('data-seat-state', 'selected')

  // Act 3: Avança novamente e preenche os dados do passageiro
  await bookingPage.continueToPassengersButton.click()
  await expect(bookingPage.passengersHeading).toBeVisible()
  await bookingPage.fillPassenger('A2', {
    fullName: 'Sally Ride',
    passport: 'US-CHALLENGER'
  })

  // Act 4: Vai para pagamento e clica em Voltar
  await bookingPage.continueToPaymentButton.click()
  await expect(bookingPage.paymentHeading).toBeVisible()
  await bookingPage.backToPassengersButton.click()

  // Assert: Valida que os dados do passageiro permanecem preenchidos após voltar
  await expect(bookingPage.passengersHeading).toBeVisible()
  await expect(bookingPage.getPassengerFullNameInput('A2')).toHaveValue('Sally Ride')
  await expect(bookingPage.getPassengerPassportInput('A2')).toHaveValue('US-CHALLENGER')
})

test('deve impedir a seleção de assento que já foi reservado e exibir alerta', async ({ page }) => {
  // Arrange: Cria missão e efetua reserva prévia do assento A1
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Artemis Scout',
    baseId: 'alpha',
    departureDate: '2028-12-01',
    returnDate: '2028-12-08',
    price: 150000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Efetua uma reserva para o assento A1
  await bookingPage.go(mission.id)
  await expect(bookingPage.seatMap).toHaveAttribute('data-loading', 'false')
  await bookingPage.selectSeat('A1')
  await bookingPage.continueToPassengersButton.click()
  await bookingPage.fillPassenger('A1', {
    fullName: 'Michael Collins',
    passport: 'US-APOLLO11'
  })
  await bookingPage.continueToPaymentButton.click()
  await bookingPage.fillPayment({
    contactEmail: 'collins@lunarpass.dev',
    cardName: 'Michael Collins',
    cardNumber: '4242 4242 4242 4242',
    expiry: '11/28',
    cvv: '123'
  })
  await bookingPage.payButton.click()
  await expect(bookingPage.confirmationSection).toBeVisible({ timeout: 15_000 })

  // Act: Tenta acessar novamente a mesma missão e clicar no assento A1 agora ocupado
  await bookingPage.go(mission.id)
  await expect(bookingPage.seatsHeading).toBeVisible()
  await expect(bookingPage.seatMap).toHaveAttribute('data-loading', 'false')
  await expect(bookingPage.getSeat('A1')).toHaveAttribute('data-seat-state', 'occupied')

  // Clica no assento ocupado
  await bookingPage.selectSeat('A1', { force: true })

  // Assert: Valida a mensagem de erro informativa
  await expect(bookingPage.seatSelectionError).toHaveText('O assento A1 já está ocupado. Escolha outro.')
})

test('deve exibir mensagem de missão esgotada quando todos os 4 assentos estiverem ocupados', async ({ page }) => {
  // Arrange: Cria missão de teste
  const mission: Mission = {
    id: `LP-${faker.string.alphanumeric({ length: 4, casing: 'upper' })}`,
    rocket: 'Full Moon Express',
    baseId: 'aurora',
    departureDate: '2029-06-01',
    returnDate: '2029-06-08',
    price: 250000.00
  }
  testMission = mission
  await cleanAndInsertMission(mission)

  // Efetua a reserva dos 4 assentos (A1, A2, B1, B2)
  await bookingPage.go(mission.id)
  await bookingPage.selectSeat('A1')
  await bookingPage.selectSeat('A2')
  await bookingPage.selectSeat('B1')
  await bookingPage.selectSeat('B2')
  await bookingPage.continueToPassengersButton.click()

  await bookingPage.fillPassenger('A1', { fullName: 'Passageiro Um', passport: 'PASS01' })
  await bookingPage.fillPassenger('A2', { fullName: 'Passageiro Dois', passport: 'PASS02' })
  await bookingPage.fillPassenger('B1', { fullName: 'Passageiro Tres', passport: 'PASS03' })
  await bookingPage.fillPassenger('B2', { fullName: 'Passageiro Quatro', passport: 'PASS04' })
  await bookingPage.continueToPaymentButton.click()

  await bookingPage.fillPayment({
    contactEmail: 'full@lunarpass.dev',
    cardName: 'Comandante Chefe',
    cardNumber: '4242 4242 4242 4242',
    expiry: '10/28',
    cvv: '123'
  })
  await bookingPage.payButton.click()
  await expect(bookingPage.confirmationSection).toBeVisible({ timeout: 15_000 })

  // Act: Acessa a página de reservas da missão agora totalmente esgotada
  await bookingPage.go(mission.id)

  // Assert: Verifica se a tela exibe o estado de "Missão esgotada"
  await expect(bookingPage.soldOutHeading).toBeVisible()
  await expect(page.getByText('Todos os assentos desta missão já foram reservados.')).toBeVisible()
  await expect(page.getByRole('link', { name: /Ver outras missões/i })).toBeVisible()
})
