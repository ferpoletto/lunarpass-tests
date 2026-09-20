import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { Navbar } from '../pages/components/navbar'

/**
 * Suite de Testes: Autenticação no Mission Control (/mission-control/login)
 * 
 * Cobre:
 * 1. Autenticação com credenciais válidas e acesso ao Dashboard
 * 2. Fluxo de Logout administrativo
 * 3. Tentativas com senha incorreta
 * 4. Tentativas com usuário inexistente
 * 5. Validação de campo de e-mail obrigatório/inválido
 * 6. Validação de campo de senha obrigatório
 * 7. Validação de submissão com campos totalmente vazios
 */
let loginPage: LoginPage
let navbar: Navbar

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navbar = new Navbar(page)
    await loginPage.go()
})

test('deve autenticar no controle de missões com credenciais válidas', async ({ page }) => {
    // Act: Informa e-mail e senha de administrador cadastrado
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')

    // Assert: Valida redirecionamento para o Mission Control e exibição do botão de logout
    await page.waitForURL('**/mission-control')
    await expect(navbar.logoutButton).toBeVisible({ timeout: 15_000 })
})

test('deve realizar logout administrativo com sucesso', async ({ page }) => {
    // Arrange: Efetua login
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
    await expect(navbar.logoutButton).toBeVisible({ timeout: 15_000 })

    // Act: Clica no botão Sair
    await navbar.logoutButton.click()

    // Assert: Redireciona de volta para a tela de login
    await page.waitForURL('**/mission-control/login')
    await expect(loginPage.title).toBeVisible()
})

test('não deve autenticar com senha incorreta', async ({ page }) => {
    // Act: Tenta logar com senha divergente
    await loginPage.login('buzz@lunarpass.dev', 'senhaInvalida123')

    // Assert: Mensagem de erro informativa
    await expect(loginPage.alert).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail não cadastrado', async ({ page }) => {
    // Act: Tenta logar com usuário não existente no Supabase Auth
    await loginPage.login('naoexiste@lunarpass.dev', 'pwd123')

    // Assert: Mensagem de erro de credenciais inválidas
    await expect(loginPage.alert).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com formato de e-mail inválido', async ({ page }) => {
    // Act: Tenta submeter apenas espaços ou formato inválido
    await loginPage.login(' ', 'pwd123')

    // Assert: Validação de campo de e-mail
    await expect(loginPage.alert).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campo de senha vazio', async ({ page }) => {
    // Act: Submete e-mail preenchido mas senha em branco
    await loginPage.login('buzz@lunarpass.dev', '')

    // Assert: Validação de obrigatoriedade da senha
    await expect(loginPage.alert).toHaveText('Informe a senha')
})

test('não deve autenticar com todos os campos vazios', async ({ page }) => {
    // Act: Clica em entrar sem preencher nenhum campo
    await loginPage.login(' ', ' ')

    // Assert: Validação de e-mail prioritária
    await expect(loginPage.alert).toHaveText('Informe um e-mail válido')
})


