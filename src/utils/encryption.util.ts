import * as crypto from 'crypto';

export type EncodingType = 'base64' | 'binary' | 'utf8' | 'utf-8';

export type SupportedHmacAlgorithm = 'sha256' | 'sha384' | 'sha512';

export type SupportedHmacOutputType = 'base64' | 'hex';

export const createHmac = function (
  message: string,
  key: Buffer,
  algorithm: SupportedHmacAlgorithm = 'sha256',
  outputType: SupportedHmacOutputType = 'base64',
) {
  const hmac = crypto.createHmac(algorithm, key);
  return hmac.update(message).digest(outputType);
};

export const decodeBase64 = function (base64Str) {
  return Buffer.from(base64Str, 'base64').toString();
};

export const base64ToBinary = function (base64Str: string) {
  return Buffer.from(base64Str, 'base64');
};

export const encodeBase64 = function (str, encoding: EncodingType = 'utf-8') {
  return Buffer.from(str, encoding).toString('base64');
};
