import * as fs from 'fs'
import {describe, it, expect, jest} from '@jest/globals'
import {CypressTestData, createTestsData} from './cypress'

jest.mock('./s3', () => ({
  async getCypressScreenshotUrls() {
    return Promise.resolve({
      'cypress/integration/apps/manage.feature': 'screenshot1.png',
      'cypress/integration/tasks/manage.feature': 'screenshot2.png'
    })
  }
}))

describe('createTestsData', () => {
  it('creates a table with the necessary data', async () => {
    const reportData: CypressTestData = JSON.parse(
      fs.readFileSync('fixtures/cypress/report.json', 'utf-8')
    )
    const table = await createTestsData(reportData)
    expect(table[0]).toEqual({
      file: 'cypress/integration/apps/manage.feature',
      suite: 'Manage Apps',
      test: 'List all the apps',
      screenshotUrl: 'screenshot1.png'
    })
    expect(table[1]).toEqual({
      file: 'cypress/integration/tasks/manage.feature',
      suite: 'Manage tasks',
      test: 'List existing tasks',
      screenshotUrl: 'screenshot2.png'
    })
  })
})
