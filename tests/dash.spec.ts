import { test, expect } from '@playwright/test'
import { Mission } from '../support/types'
import { cleanAndInsertMission, cleanMission, insertReservation } from '../support/db'
import { DashPage } from '../pages/dash.page'
import { LoginPage } from '../pages/login.page'
import { EditPage } from '../pages/edit.page'

let dashPage: DashPage
let loginPage: LoginPage
let editPage: EditPage
let createdMissions: Mission[] = []

test.beforeEach(async ({ page }) => {
    dashPage = new DashPage(page)
    loginPage = new LoginPage(page)
    editPage = new EditPage(page)
    createdMissions = []

    await loginPage.go()
    await loginPage.login('buzz@lunarpass.dev', 'pwd123')
    await page.waitForURL('**/mission-control')
    await expect(page.getByRole('button', { name: 'Sair' })).toBeVisible()
})

test.afterEach(async () => {
    while (createdMissions.length > 0) {
        const m = createdMissions.pop()
        if (m) {
            await cleanMission(m)
        }
    }
})

test.describe('Consulta e Filtros', () => {
    test('deve consultar missão com sucesso por ID', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-C001',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)

        // Act
        await dashPage.searchMission(mission.id)

        // Assert
        await dashPage.validateMissionRow(mission)
    })

    test('deve filtrar missões por nome do foguete', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-FALC',
            rocket: 'Falcon Heavy Explorer',
            baseId: 'alpha',
            departureDate: '2028-03-10',
            returnDate: '2028-03-17',
            price: 1500.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)

        // Act
        await dashPage.search(mission.rocket)

        // Assert
        const row = dashPage.getRow(mission.id)
        await expect(row).toBeVisible()
        await expect(row).toContainText(mission.rocket)
    })

    test('deve exibir mensagem de estado vazio ao pesquisar por termo inexistente', async () => {
        // Act
        await dashPage.search('LP-9999NONEXISTENT')

        // Assert
        await expect(dashPage.rows).toHaveCount(0)
        await expect(dashPage.emptyState).toBeVisible()
    })
})

test.describe('Exclusão de Missões', () => {
    test('deve excluir missão com sucesso', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-DEL1',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.requestDelete(mission.id)
        await expect(dashPage.confirmModalHeading).toBeVisible()
        await expect(dashPage.confirmModal).toContainText(`Excluir a missão ${mission.id}?`)
        await dashPage.confirmDelete()

        // Assert
        await expect(dashPage.toast).toContainText('Missão excluída')

        // Validação pós-exclusão no campo de consulta
        await dashPage.search(mission.id)
        await expect(dashPage.getRow(mission.id)).not.toBeVisible()
        await expect(dashPage.rows).toHaveCount(0)
        await expect(dashPage.emptyState).toBeVisible()
    })

    test('deve cancelar a exclusão ao clicar em Cancelar no modal', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-CAN1',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.requestDelete(mission.id)
        await expect(dashPage.confirmModalHeading).toBeVisible()
        await dashPage.cancelDelete()

        // Assert
        await expect(dashPage.confirmModal).not.toBeVisible()
        await expect(dashPage.getRow(mission.id)).toBeVisible()
    })

    test('não deve permitir excluir missão que possui reservas vinculadas', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-RES1',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await insertReservation(mission.id)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.requestDelete(mission.id)
        await expect(dashPage.confirmModalHeading).toBeVisible()
        await dashPage.confirmDelete()

        // Assert
        await expect(dashPage.confirmModalAlert).toBeVisible()
        await expect(dashPage.confirmModalAlert).toHaveText('Esta missão possui reservas e não pode ser excluída.')

        // Modal permanece aberto com a missão protegida
        await dashPage.cancelDelete()
        await expect(dashPage.getRow(mission.id)).toBeVisible()
    })
})

test.describe('Edição de Missões', () => {
    test('deve exibir o campo ID da missão desabilitado (não editável)', async ({ page }) => {
        // Arrange
        const mission: Mission = {
            id: 'LP-ED01',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.getEditButton(mission.id).click()

        // Assert
        await expect(page).toHaveURL(`/mission-control/${mission.id}/edit`)
        await expect(editPage.heading).toHaveText(mission.id)
        await expect(editPage.idInput).toBeDisabled()
        await expect(editPage.idInput).toHaveValue(mission.id)
    })

    test('deve atualizar os dados operacionais da missão com sucesso', async ({ page }) => {
        // Arrange
        const mission: Mission = {
            id: 'LP-ED02',
            rocket: 'Falcon 9',
            baseId: 'alpha',
            departureDate: '2028-05-15',
            returnDate: '2028-05-22',
            price: 1200.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.getEditButton(mission.id).click()
        await editPage.updateDetails({
            rocket: 'Starship Heavy Mk2',
            baseId: 'orion',
            price: 2500.00
        })
        await editPage.submit()

        // Assert
        await expect(editPage.toast).toContainText('Alterações salvas')
        await page.waitForURL('**/mission-control**')

        await dashPage.searchMission(mission.id)
        const updatedRow = dashPage.getRow(mission.id)
        await expect(updatedRow).toContainText('Starship Heavy Mk2')
        await expect(updatedRow).toContainText('Base Orion')
        await expect(updatedRow).toContainText('2,500.00')
    })

    test('não deve salvar com campo foguete vazio (validação de obrigatório)', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-VL01',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.getEditButton(mission.id).click()
        await editPage.rocketInput.fill('')
        await editPage.submit()

        // Assert
        await expect(editPage.alert).toBeVisible()
        await expect(editPage.alert).toHaveText('Informe o foguete')
    })

    test('não deve salvar com preço inválido (zero ou negativo)', async () => {
        // Arrange
        const mission: Mission = {
            id: 'LP-VL02',
            rocket: 'Starship',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.getEditButton(mission.id).click()
        await editPage.priceInput.fill('0')
        await editPage.submit()

        // Assert
        await expect(editPage.alert).toBeVisible()
        await expect(editPage.alert).toHaveText('Informe um preço válido')
    })

    test('deve cancelar a edição e retornar ao dashboard sem alterar dados', async ({ page }) => {
        // Arrange
        const mission: Mission = {
            id: 'LP-BK01',
            rocket: 'Starship Original',
            baseId: 'aurora',
            departureDate: '2028-01-20',
            returnDate: '2028-01-27',
            price: 1000.00
        }
        createdMissions.push(mission)
        await cleanAndInsertMission(mission)
        await dashPage.searchMission(mission.id)

        // Act
        await dashPage.getEditButton(mission.id).click()
        await editPage.updateDetails({ rocket: 'Nome Que Nao Deve Ser Salvo' })
        await editPage.back()

        // Assert
        await expect(page).toHaveURL('/mission-control')
        await dashPage.searchMission(mission.id)
        const row = dashPage.getRow(mission.id)
        await expect(row).toContainText('Starship Original')
    })
})