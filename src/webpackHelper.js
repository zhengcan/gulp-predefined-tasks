import _ from 'lodash';
import path from 'path';

function initEntry(entry, srcDir, prepend = []) {
  if (typeof entry === 'string') {
    if (prepend.length === 0) {
      return srcDir + entry;
    } else {
      return _.concat(prepend, srcDir + entry);
    }
  } else if (typeof entry === 'array') {
    return _.concat(prepend, _.map(entry, v => srcDir + v));
  } else if (typeof entry === 'object') {
    return _.mapValues(entry, (v) => {
      if (typeof v === 'string') {
        if (prepend.length === 0) {
          return srcDir + v;
        } else {
          return _.concat(prepend, srcDir + v);
        }
      } else if (typeof v === 'array') {
        return _.concat(prepend, _.map(v, sv => srcDir + sv));
      } else {
        console.warn('Unknown entry value: ' + v);
      }
    });
  } else {
    return entry;
  }
}

function initEntryForHMR(entry, srcDir, { host, port }) {
  let prepend = [
    // necessary for hot reloading with IE
    'eventsource-polyfill',
    // activate HMR for React
    'react-hot-loader/patch',
    // bundle the client for webpack-dev-server and connect to the provided endpoint
    `webpack-dev-server/client?http://${host}:${port}`,
    // bundle the client for hot reloading only- means to only hot reload for successful updates
    'webpack/hot/only-dev-server',
  ];
  return initEntry(entry, srcDir, prepend);
}

export default {
  initEntry,
  initEntryForHMR,
};
