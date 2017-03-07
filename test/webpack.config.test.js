import { should, expect, assert } from 'chai';
import { createDevConfig, createProdConfig, createWatchConfig } from '../src/webpack.config';

function baseTest(factory) {
  it('export function', () => {
    expect(factory).is.not.null;
    expect(factory).is.function;
  });

  it('default config', () => {
    let config = factory();
    expect(config).is.not.null;
    expect(config.entry).is.undefined;
    expect(config.output).is.undefined;
    expect(config.resolve).is.not.null;
    expect(config.module).is.not.null;
    expect(config.plugins).is.not.null;
  });
}

describe('createDevConfig @ webpack.config.js', () => {
  let factory = createDevConfig;
  baseTest(factory);
});

describe('createProdConfig @ webpack.config.js', () => {
  let factory = createProdConfig;
  baseTest(factory);
});

describe('createWatchConfig @ webpack.config.js', () => {
  let factory = createWatchConfig;
  baseTest(factory);
});
