import { nanoid } from 'nanoid';

export const generateRandomString = function (length: number) {
  if (typeof length !== 'number' || !Number.isInteger(length) || length < 1) {
    throw new Error('length must be a positive integer');
  }
  return nanoid(length);
};
