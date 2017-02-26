import _ from 'lodash';
import './sample.less';
import './JPEG.jpg';
import './PNG.png';
import './SVG.svg';

console.log('world');

export default () => {
  return _.uniqueId('wahaha');
}
