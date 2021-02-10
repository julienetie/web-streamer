import {webkit} from 'playwright';
import chai from 'chai';
const expect = chai.expect

let page, browser, context

describe('Test', () => {
    beforeEach(async function() {
        this.timeout(35000)
        browser =  await webkit.launch({headless: false});
        context = await browser.newContext()
        page = await context.newPage('http://localhost:3333/test.html');
    })

    // afterEach(async function() {
    //     await page.screenshot({ path: `${this.currentTest.title.replace(/ +/g, '_')}.png` })
    //     await browser.close()
    // })

    it('Checks the title of the page', async() => {
        await page.goto('http://localhost:3333/test.html');
        const title = await page.title()
        expect(title).to.equal('Web Streamer')
    })
})