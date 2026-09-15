import {test,expect} from '@playwright/test'

test('deve autenticar no controle de missões', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()
/*
    await page.locator('input[type=email]').fill('buzz@lunarpass.dev')
    await page.locator('input[type=password]').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()
*/
    await page.getByLabel('E-mail').fill('buzz@lunarpass.dev')
    await page.getByLabel('Senha').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()

    await page.waitForURL('http://localhost:3000/mission-control')
    const title1 = page.getByRole('heading', {name: 'Lunar Pass'})
    await expect(title1).toBeVisible()

    const logoutButton = page.getByRole('button', {name: 'Sair'})
    await expect(logoutButton).toBeVisible()
    await page.waitForTimeout(2000)
})

test('não deve autenticar com senha incorreta', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()

    await page.getByLabel('E-mail').fill('buzz@lunarpass.dev')
    await page.getByLabel('Senha').fill('errado')
    await page.getByRole('button', {name: 'Entrar'}).click()

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail não cadastrado', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()

    await page.getByLabel('E-mail').fill('fernandopoletto@lunarpass.dev')
    await page.getByLabel('Senha').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('E-mail ou senha inválidos.')
})

test('não deve autenticar com e-mail vazio', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()

    //await page.getByLabel('E-mail').fill('fernandopoletto@lunarpass.dev')
    await page.getByLabel('Senha').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campos vazios', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()

    //await page.getByLabel('E-mail').fill('fernandopoletto@lunarpass.dev')
    await page.getByLabel('Senha').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe um e-mail válido')
})

test('não deve autenticar com campos senha vazio', async ({ page }) => {
    await page.goto('http://localhost:3000/mission-control/login')

    const title = page.getByRole('heading', {name: 'Mission Control'})
    await expect(title).toBeVisible()

    await page.getByLabel('E-mail').fill('fernandopoletto@lunarpass.dev')
    //await page.getByLabel('Senha').fill('pwd123')
    await page.getByRole('button', {name: 'Entrar'}).click()

    const errorMessage = page.locator('p[role=alert]')
    await expect(errorMessage).toHaveText('Informe a senha')
})

