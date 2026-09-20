import {Page, Locator, expect} from '@playwright/test';

export class Navbar {
    readonly page: Page;
    readonly logoutButton: Locator;
    readonly logout: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.logoutButton = page.getByRole('button', {name: 'Sair'});
        this.logout = this.logoutButton;
    }
}