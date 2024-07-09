import { HttpModuleAsyncOptions } from '../http/http.types';

export type CoinbaseHttpExtraOptions = {
  apiKey: string;
  secret: string;
  passPhrase: string;
};
export type CoinbaseHttpOptions = HttpModuleAsyncOptions &
  CoinbaseHttpExtraOptions;

export type CoinbaseWsOptions = {
  directMarketWsUri: string;
  marketWsUri: string;
};
export type CoinbaseModuleOption = {
  httpOptions: CoinbaseHttpOptions;
  wssOptions: CoinbaseWsOptions;
};

export const MODULE_OPTIONS = Symbol.for('MODULE_OPTIONS');
export const CB_HTTP_OPTIONS_TOKEN = Symbol.for('CB_HTTP_OPTIONS_TOKEN');
