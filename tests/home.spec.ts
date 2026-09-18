import { test, expect } from '@playwright/test'

test('deve validar o título na aba do navegador', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lunar Pass/)
})


test('deve exibir o slogan na aba do navegador de teste', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  const slogan = page.getByRole('heading', {name: 'Sua viagem para a Lua começa aqui.'})
  await expect(slogan).toBeVisible()
})
