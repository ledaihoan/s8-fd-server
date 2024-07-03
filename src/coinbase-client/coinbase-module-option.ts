import { HttpModuleAsyncOptions } from '../http/http.types';

export type CoinbaseHttpOptions = {
  apiKey: string;
  secret: string;
  passPhrase: string;
};
export type CoinbaseModuleOption = {
  httpOptions: HttpModuleAsyncOptions & CoinbaseHttpOptions;
};

export const MODULE_OPTIONS = Symbol.for('MODULE_OPTIONS');
