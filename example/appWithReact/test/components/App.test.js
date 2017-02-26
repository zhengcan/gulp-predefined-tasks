import React from 'react';
import { should, expect, assert } from 'chai';
import App from '../../src/components/App';
import ReactTestUtils from 'react-addons-test-utils';

describe('Test <App />',() => {
  it('render on fly', () => {
    assert.isNotNull(App);
    let app = <App />;
    assert.isObject(app);
    let renderer = ReactTestUtils.createRenderer();
    renderer.render(app);
    let result = renderer.getRenderOutput();
    expect(result.type).to.be.eq('div');
    expect(result.props.className).to.be.eq('app');
  });
});
