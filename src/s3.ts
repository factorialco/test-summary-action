import * as core from '@actions/core'
import {SummaryData} from './cypress'

export interface S3Config {
  bucketName: string
  region: string
}

export const getCypressScreenshotUrls = (
  data: Omit<SummaryData, 'screenshotUrl'>[],
  {bucketName, region}: S3Config
): Record<string, string> => {
  const baseUrl = `https://${bucketName}.s3.${region}.amazonaws.com`
  const objectPrefix = `cypress/${core.getInput('sha')}/screenshots`
  const screenshotEntries = data.map(({file, test}) => {
    return [
      file,
      encodeURI(
        `${baseUrl}/${objectPrefix}${file.replace(
          /cypress\/integration/,
          ''
        )}/${test}.png`
      )
    ]
  })

  return Object.fromEntries(screenshotEntries)
}
