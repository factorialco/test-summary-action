import * as core from '@actions/core'
import {getCypressScreenshotUrls, S3Config} from './s3'

export interface CypressTestData {
  results: CypressFileResult[]
}

interface CypressFileResult {
  fullFile: string
  suites: CypressSuiteResult[]
}

interface CypressSuiteResult {
  title: string
  tests: CypressTestResult[]
}

interface CypressTestResult {
  title: string
  fail: boolean
  err: {
    message: string
  }
}

export interface SummaryData {
  file: string
  suite: string
  test: string
  error: string
  screenshotUrl: string
}

export const generateCypressTestSummary = (
  reportData: CypressTestData,
  s3Config: S3Config
): void => {
  const data = createTestsData(reportData, s3Config)
  return generateSummary(data)
}

export const createTestsData = (
  reportData: CypressTestData,
  s3Config: S3Config
): SummaryData[] => {
  const data: Omit<SummaryData, 'screenshotUrl'>[] = reportData.results
    .flatMap(({fullFile, suites}) =>
      suites.flatMap(({title: suiteTitle, tests}) =>
        tests.map(({title, fail, err: {message}}) =>
          fail
            ? {file: fullFile, suite: suiteTitle, test: title, error: message}
            : null
        )
      )
    )
    .filter(
      (testData): testData is Omit<SummaryData, 'screenshotUrl'> =>
        testData !== null
    )

  const screenshotUrls = getCypressScreenshotUrls(data, s3Config)

  return data.map(testData => ({
    ...testData,
    screenshotUrl: screenshotUrls[testData.file]
  }))
}

export const generateSummary = (testsData: SummaryData[]): void => {
  const gitHubSummary = process.env.GITHUB_STEP_SUMMARY

  if (!gitHubSummary) {
    return core.setFailed('⛔  Unable to find GITHUB_STEP_SUMMARY env var!')
  }

  core.summary.addHeading('🧪 Cypress results')

  for (const {file, suite, test, error, screenshotUrl} of testsData) {
    core.summary.addHeading(`${suite} > ${test}`, 2)
    core.summary.addLink(
      `❌ ${file}`,
      `https://github.com/factorialco/factorial/tree/${core.getInput(
        'sha'
      )}/e2e/${file}`
    )
    core.summary.addImage(screenshotUrl, file)
    core.summary.addRaw(
      `<details>
        <summary>Error details</summary>
        <pre>${error}</pre>
      </details>`
    )
  }

  core.summary.write()
}
