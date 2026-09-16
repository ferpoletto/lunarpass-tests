import {Page, Locator, expect} from '@playwright/test';

export class Toasty {
    readonly page: Page;
    readonly message: Locator;

    constructor(page: Page) {
        this.page = page;
        this.message = page.getByRole('listitem');
    }
}