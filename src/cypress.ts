import * as fs from 'fs'
import * as core from '@actions/core'
import {getCypressScreenshotUrls} from './s3'

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
}

export interface SummaryData {
  file: string
  suite: string
  test: string
  screenshotUrl: string
}

export const generateCypressTestSummary = async (
  reportData: CypressTestData
): Promise<void> => {
  const data = await createTestsData(reportData)
  return generateSummary(data)
}

export const createTestsData = async (
  reportData: CypressTestData
): Promise<SummaryData[]> => {
  const data: Omit<SummaryData, 'screenshotUrl'>[] = reportData.results
    .flatMap(({fullFile, suites}) =>
      suites.flatMap(({title: suiteTitle, tests}) =>
        tests.map(({title, fail}) =>
          fail ? {file: fullFile, suite: suiteTitle, test: title} : null
        )
      )
    )
    .filter(
      (testData): testData is Omit<SummaryData, 'screenshotUrl'> =>
        testData !== null
    )

  const screenshotUrls = await getCypressScreenshotUrls(data)

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

  const summary = fs.createWriteStream(gitHubSummary, {
    flags: 'a'
  })

  summary.write('### 🧪 Cypress results')
  summary.write('\n')
  summary.write('| **File** | **Suite** | **Test** | **Artifacts** |\n')
  summary.write('| -------- | --------- | -------- | ------------- |\n')
  for (const {file, suite, test, screenshotUrl} of testsData) {
    summary.write(
      `| ❌ [${file}](https://github.com/factorialco/factorial-e2e/tree/main/${file}) | ${suite} | ${test} | [🖼️](${screenshotUrl}) |\n`
    )
  }
  summary.write('\n')
  summary.close()
}
