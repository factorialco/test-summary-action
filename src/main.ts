import * as core from '@actions/core'
import * as fs from 'fs'

import {generateCypressTestSummary} from './cypress'
import {S3Config} from './s3'

type Engines = 'cypress'

export function run(): void {
  try {
    const engine = core.getInput('engine') as Engines
    const reportFile: string = core.getInput('reportFile')
    const s3Config: S3Config = {
      bucketName: core.getInput('s3BucketName'),
      region: core.getInput('s3Region')
    }

    core.info(`🔎 Generating test report summary for '${engine}'...`)

    let reportData

    try {
      reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
    } catch (err) {
      core.setFailed('⛔  Unable to find main report file!')
      return
    }

    if (engine === 'cypress') {
      generateCypressTestSummary(reportData, s3Config)
    } else {
      throw new Error(`Unknown engine '${engine}'`)
    }

    core.info('✅ Report summary generated!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
