import * as core from '@actions/core'
import * as fs from 'fs'

import {generateCypressTestSummary} from './cypress'

type Engines = 'cypress'

export async function run(): Promise<void> {
  try {
    const engine = core.getInput('engine') as Engines
    const reportFile: string = core.getInput('reportFile')

    core.info(`🔎 Generating test report summary for '${engine}'...`)

    let reportData

    try {
      reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
    } catch (err) {
      core.setFailed('⛔  Unable to find main report file!')
      return
    }

    let table

    if (engine === 'cypress') {
      table = await generateCypressTestSummary(reportData)
    } else {
      throw new Error(`Unknown engine '${engine}'`)
    }

    core.summary.addHeading(`${engine} results`).addTable(table).write()

    core.info('✅ Report summary generated!')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
