import { AxiosError } from 'axios';
import * as _ from 'lodash';

import { AxiosRequestConfigWithCustomData } from '../http.types';

const namespace = 'retry';

const denyList = new Set([
  'ENOTFOUND',
  'ENETUNREACH',

  // SSL errors from https://github.com/nodejs/node/blob/fc8e3e2cdc521978351de257030db0076d79e0ab/src/crypto/crypto_common.cc#L301-L328
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
  'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
  'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
  'CERT_SIGNATURE_FAILURE',
  'CRL_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID',
  'CERT_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_HAS_EXPIRED',
  'ERROR_IN_CERT_NOT_BEFORE_FIELD',
  'ERROR_IN_CERT_NOT_AFTER_FIELD',
  'ERROR_IN_CRL_LAST_UPDATE_FIELD',
  'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
  'OUT_OF_MEM',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_CHAIN_TOO_LONG',
  'CERT_REVOKED',
  'INVALID_CA',
  'PATH_LENGTH_EXCEEDED',
  'INVALID_PURPOSE',
  'CERT_UNTRUSTED',
  'CERT_REJECTED',
  'HOSTNAME_MISMATCH',
]);

export function isRetryAllowed(error: any) {
  return !denyList.has(error && error?.code);
}

export function isNetworkError(error: any) {
  return (
    !error.response &&
    Boolean(error.code) && // Prevents retrying cancelled requests
    error.code !== 'ECONNABORTED' && // Prevents retrying timed out requests
    isRetryAllowed(error)
  ); // Prevents retrying unsafe errors
}

export const SAFE_HTTP_METHODS = ['get', 'head', 'options'];
export const IDEMPOTENT_HTTP_METHODS = SAFE_HTTP_METHODS.concat([
  'put',
  'delete',
]);

/**
 * @param  {Error}  error
 * @return {boolean}
 */
export function isRetryableError(error: AxiosError) {
  return (
    error.code !== 'ECONNABORTED' &&
    (!error.response ||
      (error.response.status >= 500 && error.response.status <= 599))
  );
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
export function isSafeRequestError(error: AxiosError) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return (
    isRetryableError(error) &&
    _.includes(SAFE_HTTP_METHODS, error.config.method)
  );
}

/**
 * @param  {Error}  error
 * @return {boolean}
 */
export function isIdempotentRequestError(error: AxiosError) {
  if (!error.config) {
    // Cannot determine if the request can be retried
    return false;
  }

  return (
    isRetryableError(error) &&
    _.includes(IDEMPOTENT_HTTP_METHODS, error.config.method)
  );
}

/**
 * @param  {Error}  error
 * @return {boolean | Promise}
 */
export function isNetworkOrIdempotentRequestError(error: AxiosError) {
  return isNetworkError(error) || isIdempotentRequestError(error);
}

/**
 * @return {number} - delay in milliseconds, always 0
 */
export function noDelay() {
  return 0;
}

/**
 * @param  {number} [retryNumber=0]
 * @return {number} - delay in milliseconds
 */
export function exponentialDelay(retryNumber = 0) {
  const delay = 2 ** retryNumber * 1000;
  const randomSum = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + randomSum;
}

export function getCurrentState(config: AxiosRequestConfigWithCustomData) {
  const currentState = config[namespace] || {};
  currentState.retryCount = currentState.retryCount || 0;
  // eslint-disable-next-line no-param-reassign
  config[namespace] = currentState;
  return currentState;
}

/**
 * Returns the axios-retry options for the current request
 * @param  {AxiosRequestConfig} config
 * @param  {AxiosRetryConfig} defaultOptions
 * @return {AxiosRetryConfig}
 */
export function getRequestOptions(config: AxiosRequestConfigWithCustomData) {
  return { ...config[namespace] };
}

/**
 * Checks retryCondition if request can be retried. Handles it's retruning value or Promise.
 * @param  {number} retries
 * @param  {Function} retryCondition
 * @param  {Object} currentState
 * @param  {Error} error
 * @return {boolean}
 */
export async function shouldRetry(
  retries: number,
  retryCondition: (error: AxiosError) => Promise<boolean>,
  currentState: any,
  error: AxiosError,
) {
  const shouldRetryOrPromise =
    currentState.retryCount < retries && retryCondition(error);

  // This could be a promise
  if (typeof shouldRetryOrPromise === 'object') {
    try {
      await shouldRetryOrPromise;
      return true;
    } catch (_err) {
      return false;
    }
  }
  return shouldRetryOrPromise;
}
