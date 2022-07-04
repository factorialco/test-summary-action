import {describe, it, expect} from '@jest/globals'
import {CypressTestData, generateCypressTestSummary} from './cypress'

describe('generateCypressTestSummary', () => {
  it('creates a table with the necessary data', async () => {
    const reportData: CypressTestData = {
      results: [
        {
          fullFile: 'File',
          suites: [
            {
              title: 'Suite',
              tests: [
                {
                  title: 'Test 1',
                  fail: true
                },
                {
                  title: 'Test 2',
                  fail: false
                },
                {
                  title: 'Test 3',
                  fail: true
                }
              ]
            }
          ]
        }
      ]
    }
    const table = await generateCypressTestSummary(reportData)
    expect(table[1]).toEqual(['File', 'Suite', 'Test 1', 'TODO'])
    expect(table[2]).toEqual(['File', 'Suite', 'Test 3', 'TODO'])
  })
})
