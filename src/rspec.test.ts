import * as fs from 'fs'
import {describe, it, expect} from '@jest/globals'
import {RSpecTestData, createTestsData} from './rspec'

describe('createTestsData', () => {
  it('creates a table with the necessary data', () => {
    const reportData: RSpecTestData = JSON.parse(
      fs.readFileSync('fixtures/rspec/report.json', 'utf-8')
    )
    const table = createTestsData(reportData)
    expect(table[0]).toEqual({
      file: 'backend/components/timeoff/spec/controllers/timeoff/leaves_controller_spec.rb',
      test: 'Timeoff::LeavesController GET #index for a manager is expected to eq "over9000"',
      error: {
        message: expect.stringMatching(
          'RSpec::Expectations::ExpectationNotMetError'
        ),
        details: expect.stringMatching(
          '/workspace/bundle/gems/rspec-support-3.10.2'
        )
      }
    })
  })
})
