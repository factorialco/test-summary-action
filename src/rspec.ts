import * as core from '@actions/core'

export interface RSpecTestData {
  examples: RSpecExampleData[]
}

type Status = 'passed' | 'failed'

interface RSpecExampleData {
  status: Status
  full_description: string
  file_path: string
  exception?: {
    class: string
    message: string
    backtrace: string[]
  }
}

export interface SummaryData {
  file: string
  test: string
  error: ErrorSummaryData
}

interface ErrorSummaryData {
  message: string
  details: string
}

export const generateRSpecTestSummary = (reportData: RSpecTestData): void => {
  const data = createTestsData(reportData)
  return generateSummary(data)
}

export const createTestsData = (reportData: RSpecTestData): SummaryData[] => {
  return reportData.examples
    .filter(
      (example): example is Required<RSpecExampleData> =>
        example.status === 'failed'
    )
    .map(({file_path, full_description, exception}) => ({
      file: file_path.replace('./', 'backend/'),
      test: full_description,
      error: {
        message: [exception.class, exception.message].join('\n'),
        details: exception.backtrace.join('\n')
      }
    }))
}

export const generateSummary = (testsData: SummaryData[]): void => {
  const gitHubSummary = process.env.GITHUB_STEP_SUMMARY

  if (!gitHubSummary) {
    return core.setFailed('⛔  Unable to find GITHUB_STEP_SUMMARY env var!')
  }

  core.summary.addHeading('🧪 RSpec results')

  for (const {
    file,
    test,
    error: {message, details}
  } of testsData) {
    core.summary.addHeading(`${test}`, 2)

    core.summary.addLink(
      `❌ ${file}`,
      `https://github.com/factorialco/factorial/tree/${core.getInput(
        'sha'
      )}/${file}`
    )

    core.summary.addCodeBlock(message)

    core.summary.addRaw(
      `<details>
          <summary>Error details</summary>
          <pre>${details}</pre>
        </details>`
    )
  }

  core.summary.write()
}
