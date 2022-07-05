import * as Minio from 'minio'
import * as core from '@actions/core'
import {SummaryData} from './cypress'

export const getCypressScreenshotUrls = async (
  data: Omit<SummaryData, 'screenshotUrl'>[]
): Promise<Record<string, string>> => {
  const client = new Minio.Client({
    endPoint: 's3.amazonaws.com',
    accessKey: core.getInput('s3AccessKey'),
    secretKey: core.getInput('s3SecretKey')
  })
  const bucketName = 'gh-actions-nodejs-cache'
  const objectPrefix = `test-summary/cypress/${core.getInput(
    'sha'
  )}/screenshots`

  const screenshotEntries = await Promise.all(
    data.map(async ({file, test}) => {
      return new Promise<[string, string]>(resolve => {
        const fileName = `${objectPrefix}${file.replace(
          /cypress\/integration/,
          ''
        )}/${test}.png`
        client.presignedGetObject(
          bucketName,
          fileName,
          24 * 60 * 60,
          (_error, presignedUrl) => {
            resolve([file, presignedUrl])
          }
        )
      })
    })
  )

  return Object.fromEntries(screenshotEntries)
}
