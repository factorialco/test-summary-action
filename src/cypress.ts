/* eslint-disable @typescript-eslint/explicit-function-return-type */
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

export const generateCypressTestSummary = async (
  reportData: CypressTestData
) => {
  const testsData = reportData.results
    .flatMap(({fullFile, suites}) =>
      suites.flatMap(({title: suiteTitle, tests}) =>
        tests.map(({title, fail}) =>
          fail ? [fullFile, suiteTitle, title, 'TODO'] : null
        )
      )
    )
    .filter((testData): testData is string[] => testData !== null)
  return [
    [
      {data: 'File', header: true},
      {data: 'Suite', header: true},
      {data: 'Test', header: true},
      {data: 'Screenshot', header: true}
    ],
    ...testsData
  ]
}
