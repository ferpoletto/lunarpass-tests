import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { Navbar } from '../pages/components/navbar'

let loginPage: LoginPage
let navbar: Navbar

test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navbar = new Navbar(page)
    await loginPage.go()
})

test('deve autenticar no controle de missões', async ({ page }) => {

    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
    await expect(navbar.logoutButton).toBeVisible()
})

test('não deve autenticar com senha incorreta', async ({ page }) => {

    await loginPage.login('buzz@lunarpass.dev', 'pwdaaa123')
    await expect(loginPage.alert).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail não cadastrado', async ({ page }) => {

    await loginPage.login('404@lunarpass.dev', 'pwd123')
    await expect(loginPage.alert).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail vazio', async ({ page }) => {

    await loginPage.login(' ', 'pwd123')
    await expect(loginPage.alert).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campos vazios', async ({ page }) => {

    await loginPage.login(' ', ' ')
    await expect(loginPage.alert).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campo senha vazio', async ({ page }) => {

    await loginPage.login('buzz@lunarpass.dev', '')
    await expect(loginPage.alert).toHaveText('Informe a senha')
})

