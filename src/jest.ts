import * as core from '@actions/core'

export interface JestTestData {
  testResults: JestTestResult[]
}

type Status = 'passed' | 'failed'

interface JestTestResult {
  name: string
  message: string
  status: Status
}

export interface SummaryData {
  file: string
  error: string
}

export const generateJestTestSummary = (reportData: JestTestData): void => {
  const data = createTestsData(reportData)
  return generateSummary(data)
}

export const createTestsData = (reportData: JestTestData): SummaryData[] => {
  return reportData.testResults
    .filter(({status}) => status === 'failed')
    .map(({name, message}) => ({
      file: name.replace(/(.*)frontend(.*)/g, 'frontend$2'),
      error: message
    }))
}

export const generateSummary = (testsData: SummaryData[]): void => {
  const gitHubSummary = process.env.GITHUB_STEP_SUMMARY

  if (!gitHubSummary) {
    return core.setFailed('⛔  Unable to find GITHUB_STEP_SUMMARY env var!')
  }

  core.summary.addHeading('🧪 Jest results')

  for (const {file, error} of testsData) {
    core.summary.addLink(
      `❌ ${file}`,
      `https://github.com/factorialco/factorial/tree/${core.getInput(
        'sha'
      )}/${file}`
    )

    core.summary.addCodeBlock(error)
  }

  core.summary.write()
}
