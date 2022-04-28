import { S3 } from 'aws-sdk';
import config from 'config';
import { customUuid } from './customUuid';

export const s3UploadSingle = async (
  file: Buffer,
  resource: string,
  ext: string
) => {
  const s3 = new S3();

  const param = {
    Bucket: config.get<string>('awsBucketName'),
    Key: `${resource}/${customUuid()}.${ext}`,
    Body: file,
  };

  return await s3.upload(param).promise();
};

export const s3UploadMultiple = async (
  files: Buffer[],
  resource: string,
  ext: string
) => {
  const s3 = new S3();

  const params = files.map((file, i) => {
    return {
      Bucket: config.get<string>('awsBucketName'),
      Key: `${resource}/${customUuid()}-${i + 1}.${ext}`,
      Body: file,
    };
  });

  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};
