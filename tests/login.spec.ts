import { test, expect } from '@playwright/test'

import { LoginPage } from '../pages/login.page'

test('deve autenticar no controle de missões', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')

    await page.waitForURL('http://localhost:3000/mission-control')
    const title1 = page.getByRole('heading', {name: 'Lunar Pass'})
    await expect(title1).toBeVisible()

    const logoutButton = page.getByRole('button', {name: 'Sair'})
    await expect(logoutButton).toBeVisible()

})

test('não deve autenticar com senha incorreta', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', 'pwdaaa123')

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail não cadastrado', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login('404@lunarpass.dev', 'pwd123')

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail vazio', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login(' ', 'pwd123')

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campos vazios', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login(' ', ' ')

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campo senha vazio', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', '')

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe a senha')
})

