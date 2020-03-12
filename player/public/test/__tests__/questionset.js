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

            await page.setViewport({ width: 1280, height: 800 })
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

        it('Should open question set', async () => {
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
        })

        it('Zoom button should open the image in zoomed view', async () => {
            const zoomImg = await page.waitForSelector('#org-ekstep-contentrenderer-questionunit-questionComponent-ZoomImg')
            await zoomImg.click()
        })

        it('check pop exists or not', async () => {
            const popup = await page.waitForSelector('#image-model-popup > div.popup-full-body > div > div')
            await popup.click()
        })

        it('Test for title', async () => {
            const title = await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
        })

        it('Question title font size should be same in Mobile and Web and height and width should be different', async () => {
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

        it('Mobile view testing', async () => {
            await page.emulate(devices['iPhone 4'])
            await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()

            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')
            
            // Click on option B
            const wrongAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2) > div.option-text-container.text-only')
            await wrongAnswer.click()

            // Click on next arrow icon
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click()

            // Click on try again button
            const tryAgain = await page.waitForSelector('#popup-buttons-container > div.right.primary.button')
            await tryAgain.click()
 
            // Click on option A which is the correct answer
            const correctAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer')
            await correctAnswer.click()  
           
            // Click on next arrow icon
            await nextButton.click()

            // Click on popup next button
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click()

            // Click on next arrow icon
            await nextButton.click()

            // Click on popup next button
            const popupNextButton = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton.click()

            // setting value of first field 
            await page.waitForSelector('#ans-field1');
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'jupiter';
            });

            // setting value of second field 
            await page.waitForSelector('#ans-field2');
            await page.evaluate(() => {
                document.querySelector('#ans-field2').value = 'mercury';
            });

            // Click on next arrow icon
            await nextButton.click();

            // Click on popup next button
            const nextPopupButton2 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton2.click();
            
            // Click on next arrow icon
            await nextButton.click()                         
        
            // Click on popup next button
            const popupNextButton3 = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton3.click()

            // Arranging 'what are you looking for?'
            const select1 = await page.waitForSelector('#w0')
            await select1.click()

            const select2 = await page.waitForSelector('#w1')
            await select2.click()

            const select3 = await page.waitForSelector('#w3')
            await select3.click()

            const select4 = await page.waitForSelector('#w4')
            await select4.click()

            const select5 = await page.waitForSelector('#w5')
            await select5.click()

            // Click on next arrow icon
            await nextButton.click()

             // Click on popup next button
            const nextPopupButton4 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton4.click();

            // Setting 4 star rating
            const ratingFour = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img')
            ratingFour.click()

            // Setting value for comment
            await page.waitForSelector('#commentText');
            await page.evaluate(() => {
                document.querySelector('#commentText').value = 'test comment';
            });

            // Click on submit
            const submitButton = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div.gc-fd-footer.icon-opacity > input')
            await submitButton.click()

        })

        it('Test for title mcq flow', async () => {
            await page.setViewport({ width: 1280, height: 800 })
                                                            
            const playQuestion = await page.waitForSelector('body > div:nth-child(7) > div > ion-pane > ion-content > div > div:nth-child(38)')
            await playQuestion.click()
            await page.waitForSelector('#mcq-question-container > div.question-content-container > div > div.hiding-container > div > p')

            // Click on option B
            const wrongAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div:nth-child(2)')
            await wrongAnswer.click()

            // Click on next arrow icon
            const nextButton = await page.waitForSelector('body > div:nth-child(8) > div > div > custom-next-navigation > div > a > img')
            await nextButton.click()

            // Click on try again button
            const tryAgain = await page.waitForSelector('#popup-buttons-container > div.right.primary.button')
            await tryAgain.click()

            // Click on option A which is the correct answer
            const correctAnswer = await page.waitForSelector('#mcq-question-container > div.bg-graphics-2 > div.outer-option-container.horizontal > div > div > div.option-block.org-ekstep-questionunit-mcq-option-element.mcq-correct-answer')
            await correctAnswer.click()

            // Click on next arrow icon
            await nextButton.click()
            
            // Click on popup next button
            const nextPopupButton = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton.click()
            
            // Click on next arrow icon
            await nextButton.click()
            
            // Click on popup next button
            const popupNextButton = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton.click()

            // setting value of first field
            await page.waitForSelector('#ans-field1');
            await page.evaluate(() => {
                document.querySelector('#ans-field1').value = 'jupiter';
            });

            // setting value of second field
            await page.waitForSelector('#ans-field2');
            await page.evaluate(() => {
                document.querySelector('#ans-field2').value = 'mercury';
            });
            
            // Click on next arrow icon
            await nextButton.click();
            
            // Click on popup next button
            const nextPopupButton2 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton2.click();
            
            // Click on next arrow icon
            await nextButton.click()
            
            // Click on popup next button
            const popupNextButton2 = await page.waitForSelector('#popup-buttons-container > div.left.button')
            await popupNextButton2.click()

            // Setting value 'What are you looking for?'
            const select1 = await page.waitForSelector('#w0')
            await select1.click()

            const select2 = await page.waitForSelector('#w1')
            await select2.click()

            const select3 = await page.waitForSelector('#w3')
            await select3.click()

            const select4 = await page.waitForSelector('#w4')
            await select4.click()

            const select5 = await page.waitForSelector('#w5')
            await select5.click()

            // Click on next arrow icon
            await nextButton.click()
            
            // Click on popup next button
            const nextPopupButton3 = await page.waitForSelector('#popup-buttons-container > div')
            await nextPopupButton3.click();

            // Setting four star rating
            const ratingFour = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img')
            ratingFour.click()

            // Setting value for comment
            await page.waitForSelector('#commentText');
            await page.evaluate(() => {
                document.querySelector('#commentText').value = 'test comment';
            });

            const starFirstRatingSrc = await page.evaluate('document.querySelector("#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(1) > img").getAttribute("src")')
            const starSecondRatingSrc = await page.evaluate('document.querySelector("#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(2) > img").getAttribute("src")')
            const starThirdRatingSrc = await page.evaluate('document.querySelector("#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(3) > img").getAttribute("src")')
            const starFourthRatingSrc = await page.evaluate('document.querySelector("#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(4) > img").getAttribute("src")')
            const starFifthRatingSrc = await page.evaluate('document.querySelector("#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div:nth-child(1) > div:nth-child(5) > img").getAttribute("src")')
            
            // Click on submit button
            const submitButton = await page.waitForSelector('#gcFbPopup > div.gc-popup-new.gc-fc-popup > div.gc-popup-body-new > div > div.gc-fd-footer > input')
            await submitButton.click()

            /*
            const starFirstRatedSrc  = await page.evaluate('document.querySelector("#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-rating-cont > div > star-rating > div:nth-child(1) > img").getAttribute("src")')
            const starSeconfRatedSrc = await page.evaluate('document.querySelector("#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-rating-cont > div > star-rating > div:nth-child(2) > img").getAttribute("src")')
            const starThirdRatedSrc  = await page.evaluate('document.querySelector("#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-rating-cont > div > star-rating > div:nth-child(3) > img").getAttribute("src")')
            const starFourthRatedSrc = await page.evaluate('document.querySelector("#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-rating-cont > div > star-rating > div:nth-child(4) > img").getAttribute("src")')
            const starFifthRatedSrc  = await page.evaluate('document.querySelector("#endpage > div.gc-ep-content-holder > div.gc-ep-assessment-cont > div.gc-ep-rating-cont > div > star-rating > div:nth-child(5) > img").getAttribute("src")')
            
            console.info('starFirstRatingSrc :', starFirstRatingSrc);
            console.info('starSecondRatingSrc :', starFirstRatingSrc);
            console.info('starThirdRatingSrc :', starThirdRatingSrc);
            console.info('starFourthRatingSrc :', starFourthRatingSrc);
            console.info('starFifthRatingSrc :', starFifthRatingSrc);
            
            console.info('starFirstRatedSrc : ', starFirstRatedSrc);
            console.info('starSeconfRatedSrc : ', starSeconfRatedSrc);
            console.info('starThirdRatedSrc : ', starThirdRatedSrc);
            console.info('starFourthRatedSrc : ', starFourthRatedSrc);
            console.info('starFifthRatedSrc : ', starFifthRatedSrc); 
            */
         })

    },
    timeout
)