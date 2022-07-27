import * as fs from 'fs'
import {describe, it, expect} from '@jest/globals'
import {JestTestData, createTestsData} from './jest'

describe('createTestsData', () => {
  it('creates a table with the necessary data', () => {
    const reportData: JestTestData = JSON.parse(
      fs.readFileSync('fixtures/jest/report.json', 'utf-8')
    )
    const table = createTestsData(reportData)
    expect(table[0]).toEqual({
      file: 'frontend/src/components/Automations/AddAutomationBlockModal/List/Items/SubcategoryField/__test__/index.spec.tsx',
      error: expect.stringMatching('renders correctly the component')
    })
  })
})
