import { HttpModuleAsyncOptions } from '../http/http.types';

export type CoinbaseHttpExtraOptions = {
  apiKey: string;
  secret: string;
  passPhrase: string;
};
export type CoinbaseHttpOptions = HttpModuleAsyncOptions &
  CoinbaseHttpExtraOptions;
export type CoinbaseModuleOption = {
  httpOptions: CoinbaseHttpOptions;
};

export const MODULE_OPTIONS = Symbol.for('MODULE_OPTIONS');
export const CB_HTTP_OPTIONS_TOKEN = Symbol.for('CB_HTTP_OPTIONS_TOKEN');
