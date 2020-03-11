const timeout = 50000

const typingSpeed = 50

let jestscreenshot = require('@jeeyah/jestscreenshot');
const devices = require('puppeteer/DeviceDescriptors');

const { toMatchImageSnapshot } = require('jest-image-snapshot'); 
expect.extend({ toMatchImageSnapshot });

describe(
    'Sunbird Player functional testing - Question Set content',
    () => {
        let page
        beforeAll(async () => {
            jest.setTimeout(timeout)
            page = await global.__BROWSER__.newPage()
            await page.goto('http://127.0.0.1:3000')
            
            await page.setViewport({width: 1280,height: 800})
            // const metrics = await page.metrics();
            // console.info(metrics);
            let path = require('path');
            let scriptName = path.basename(__filename).replace('.js', '');
            let options = {
                page: page, 
                dirName: __dirname,
                scriptName: scriptName,
                onlyFailures: true
              };
              await jestscreenshot.init(options);  
        }, timeout)

        afterEach(async () => {
            await page.waitFor(5000)
        })

        afterAll(async () => {
            jestscreenshot.cleanup(function () {
                if (browser) {
                  browser.close();
                }
                done();
              });
            await page.close()
        })

        // Player instance on browser

        it('Player shell loaded with fixture stories', async () => {
            await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
        })

        it('Should open question set', async() => {
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
        })

        it('Test for title', async () => {
            const title = await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
        })

        it('Question title font size should be same in Mobile and Web and height and width should be different', async() => {
            const btnStylesInWeb = await page.$eval('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p', btnStylesInWeb => JSON.parse(JSON.stringify(getComputedStyle(btnStylesInWeb))));
            await page.emulate(devices['iPhone 4'])
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            const btnStylesInMobile = await page.$eval('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p', btnStylesInMobile => JSON.parse(JSON.stringify(getComputedStyle(btnStylesInMobile))));
            expect(btnStylesInWeb.fontsize).toEqual(btnStylesInMobile.fontsize) 
            expect(btnStylesInWeb.height).not.toEqual(btnStylesInMobile.height) 
            expect(btnStylesInWeb.width).not.toEqual(btnStylesInMobile.width) 
        })

        it('Test for title mcq flow', async () => {
            await page.setViewport({width: 1280,height: 800})
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            const wrongAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2)')
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            const previousButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-previous-navigation > div > a > img')
            const correctAnswer =  await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer')
            await wrongAnswer.click()
            await nextButton.click()
            const tryAgain = await page.waitForSelector('#popup-buttons-container > div.right.primary.button')
            await tryAgain.click()
            await correctAnswer.click()
            await nextButton.click()
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click()
        })

    },
    timeout
)