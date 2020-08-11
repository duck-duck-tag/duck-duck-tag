
/* eslint jest/expect-expect: off, jest/no-test-callback: off */
import { Selector, RequestMock } from 'testcafe';

const clickToAnalyzeImagesLink = t => t.click(Selector('a').withExactText('Analyze images'));
const assertNoConsoleErrors = async t => {
  const { error } = await t.getBrowserConsoleMessages();
  await t.expect(error).eql([]);
};


const chooseAllServices = async t => {
  const serviceSelectors = Selector('.isSelected');
  const count = await serviceSelectors.count;

  

  // Choose all services that are available

  let checkbox
  for (let i = 0; i < count; i++) {

    checkbox = serviceSelectors.nth(i)
    
    if (  !(await checkbox.checked) ) { // Click only if checkbox is not checked. Does not uncheck checkboxes
      await t.click(checkbox);
    }
    
  }
}

// Create mock

const mockServiceAzureURL = new RegExp('localhost.+azure')
const mockResponseAzure = { 'tags': [{ "name": "mountain", "confidence": 0.5404403784123804 }, { "name": "lake", "confidence": 0.6783661761715709 }, { "name": "ice", "confidence": 0.821276302354939 }, { "name": "snow", "confidence": 0.8006666542170013 }, { "name": "sky", "confidence": 0.25846473729670105 }, { "name": "white", "confidence": 0.7181846334987609 }] }

const mockServiceIBM = new RegExp('localhost.+ibm')
const mockResponseIBM = { "images": [{}, { "classifiers": [{ "classes": [{ "class": "mountain", "score": 0.1673660968812578 }, { "class": "lake", "score": 0.7731264922445409 }, { "class": "winter", "score": 0.5133554862420273 }, { "class": "forest", "score": 0.7712337043311361 }] }] }] }

const mock = RequestMock()
  .onRequestTo(mockServiceAzureURL)
  .respond(mockResponseAzure, 200, { 'Access-Control-Allow-Origin': '*' })
  .onRequestTo(mockServiceIBM)
  .respond(mockResponseIBM, 200, { 'Access-Control-Allow-Origin': '*' })

fixture`Animation tests`
  .page('../../app/app.html')
  .requestHooks(mock)
  .beforeEach(clickToAnalyzeImagesLink)
  .afterEach(assertNoConsoleErrors);

test('should display no animation when no analysis is pending', async t => {
  await t
    .expect(Selector('p').withText('').count).gte(1)
})

/*
test('should display animation while analysis is pending', async t => {
  await chooseAllServices(t)

  await t
    .setNativeDialogHandler(() => true)
    .click(Selector('button').withExactText('Analyze images'))
    .expect(Selector('p').withText('processing').count).gte(1) 
})
*/

test('should display no animation after analysis is done', async t => {

  await t
    .setNativeDialogHandler(() => true)
    .click(Selector('button').withExactText('Analyze images'))
    .wait(200)
    .expect(Selector('p').withText('').count).gte(1) 
})

fixture`Analyze image tests`
  .page('../../app/app.html')
  .requestHooks(mock)
  .beforeEach(clickToAnalyzeImagesLink)
  .afterEach(assertNoConsoleErrors);


test('tag images', async t => {

  await chooseAllServices(t)

  await t
    .setNativeDialogHandler(() => true)                         // Return true for (any) confirmation
    .click(Selector('button').withExactText('Analyze images'))  // Click Analyze
    .expect(Selector('td').withText('Azure').count).gte(1)     // Azure mentioned in a table cell at least once
    .expect(Selector('td').withText('IBM').count).gte(1)        // IBM mentioned in a table cell at least once
    .expect(Selector('table').count).eql(3)                     // We expect to see three tables: one for imagepaths, one for tags and one for analysis

})

fixture`Export tests`
  .page('../../app/app.html')
  .requestHooks(mock)
  .beforeEach(clickToAnalyzeImagesLink)
  .afterEach(assertNoConsoleErrors);    // Test that no errors appear in console


const testExportToFormat = format => {

  test('Export to ' + format, async t => {

    await chooseAllServices(t)

    await t
      .setNativeDialogHandler(() => true)                             // Return true for (any) confirmation
      .click(Selector('button').withExactText('Analyze images'))      // Click Analyze
      .click(Selector('button').withExactText('Export tags'))         // Click Export tags
      .click(Selector('button').withExactText(format))                // Choose format as format to export to
      .expect(Selector('button').withExactText(format).count).eql(0)  // After choosing the format, button should disappear

  })
}

['CSV', 'JSON', 'SQLite'].forEach(testExportToFormat)