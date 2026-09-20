import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/home.page'

/**
 * Suite de Testes: Home e Catálogo de Missões (/ e /missions)
 * 
 * Valida os fluxos de descoberta do usuário:
 * 1. Elementos essenciais de marca, título e slogan
 * 2. Navegação pelo header (Missões e Mission Control)
 * 3. Busca de missões a partir da hero section filtrando por bases lunares
 * 4. Acesso direto a missões através dos cards de bases lunares
 * 5. Exibição e integridade dos cards de missões no catálogo
 */
let homePage: HomePage

test.beforeEach(async ({ page }) => {
  homePage = new HomePage(page)
  await homePage.go()
})

test('deve validar o título da página e slogan principal', async ({ page }) => {
  // Assert: Título da aba do navegador e slogan hero
  await expect(page).toHaveTitle(/Lunar Pass/)
  await expect(homePage.slogan).toBeVisible()
  await expect(homePage.subtitle).toBeVisible()
})

test('deve navegar para a página de missões através do link no header', async ({ page }) => {
  // Act: Clica no link de navegação Missões no cabeçalho
  await homePage.navMissionsLink.click()

  // Assert: Redirecionado para /missions e exibe o cabeçalho de resultados
  await page.waitForURL('**/missions')
  await expect(homePage.resultsHeading).toBeVisible()
})

test('deve rolar para a seção de bases lunares pelo link no header', async ({ page }) => {
  // Act: Clica no link Bases no cabeçalho
  await homePage.navBasesLink.click()

  // Assert: A seção com id #bases está visível na tela
  await expect(page.locator('#bases')).toBeVisible()
})

test('deve redirecionar para a tela de login ao acessar o Mission Control sem autenticação', async ({ page }) => {
  // Act: Acessa diretamente a rota restrita do Mission Control
  await page.goto('/mission-control')

  // Assert: Guard de rota redireciona para a página de login
  await page.waitForURL('**/mission-control/login')
  await expect(page.getByRole('heading', { name: 'Mission Control' })).toBeVisible()
})

test('deve filtrar missões por base lunar a partir da busca na Home', async ({ page }) => {
  // Arrange: Localiza os checkboxes de filtro por base
  await expect(homePage.baseFilter).toBeVisible()

  // Act: Marca a base Aurora e clica em Buscar Missões
  // O input possui overlay de estilização no label
  await page.locator('label:has(#base-aurora)').click()
  await homePage.searchMissionsButton.click()

  // Assert: URL contém o parâmetro da base selecionada e resultados são exibidos
  await page.waitForURL('**/missions?base=aurora**')
  await expect(homePage.resultsHeading).toBeVisible()
  await expect(page.getByText('Base Base Lunar Aurora')).toBeVisible()
})

test('deve acessar o catálogo filtrado ao clicar no card de uma base lunar', async ({ page }) => {
  // Act: Clica no card da Base Lunar Orion
  const orionCard = homePage.getBaseCardLink('orion')
  await orionCard.scrollIntoViewIfNeeded()
  await orionCard.click()

  // Assert: Redirecionado para a rota de missões com filtro da Orion
  await page.waitForURL('**/missions?base=orion**')
  await expect(page.getByText('Base Base Lunar Orion')).toBeVisible()
})

test('deve exibir informações completas nos cards de missões do catálogo', async ({ page }) => {
  // Act: Acessa o catálogo de missões diretamente
  await homePage.goMissions()
  await expect(homePage.resultsHeading).toBeVisible()

  // Assert: Pelo menos um card de missão é exibido com os detalhes operacionais
  const firstCard = homePage.missionCards.first()
  await expect(firstCard).toBeVisible()
  await expect(firstCard.locator('[data-testid="mission-code"]')).not.toBeEmpty()
  await expect(firstCard.locator('[data-testid="mission-rocket"]')).not.toBeEmpty()
  await expect(firstCard.locator('[data-testid="mission-price"]')).not.toBeEmpty()
  await expect(firstCard.locator('[data-testid="departure-date"]')).toBeVisible()
  await expect(firstCard.locator('[data-testid="return-date"]')).toBeVisible()
})
