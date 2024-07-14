import { HttpModuleAsyncOptions } from '../http/http.types';

export type CoinbaseHttpExtraOptions = {
  apiKey: string;
  secret: string;
  passPhrase: string;
};
export type CoinbaseHttpOptions = HttpModuleAsyncOptions &
  CoinbaseHttpExtraOptions;

export type CoinbaseQueueOptions = {
  queueName: string;
};

export type CoinbaseWsOptions = {
  directMarketWsUri: string;
  marketWsUri: string;
};
export type CoinbaseModuleOption = {
  httpOptions: CoinbaseHttpOptions;
  wssOptions: CoinbaseWsOptions;
  queueOptions: CoinbaseQueueOptions;
};

export const MODULE_OPTIONS = Symbol.for('MODULE_OPTIONS');
export const CB_HTTP_OPTIONS_TOKEN = Symbol.for('CB_HTTP_OPTIONS_TOKEN');
export const CB_WS_QUEUE_TOKEN = Symbol.for('CB_WS_QUEUE_TOKEN');
