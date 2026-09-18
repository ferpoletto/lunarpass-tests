import { test, expect } from '@playwright/test'
import { Mission } from '../support/types'
import { cleanAndInsertMission, deleteMission } from '../support/db'
import { DashPage } from '../pages/dash.page'
import { LoginPage } from '../pages/login.page'

let dashPage: DashPage
let loginPage: LoginPage


test.beforeEach(async ({ page }) => {
    dashPage = new DashPage(page)
    loginPage = new LoginPage(page)
    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
})


test('deve consultar missão com sucesso', async ({ page }) => {
    const mission: Mission = {
        id: 'LP-0123DELETE',
        rocket: 'Starship',
        baseId: 'aurora',
        departureDate: '2028-01-20',
        returnDate: '2028-01-27',
        price: 1000.00
    }
    await cleanAndInsertMission(mission)
    await dashPage.searchMission(mission.id)
    await deleteMission(mission.id)
})

