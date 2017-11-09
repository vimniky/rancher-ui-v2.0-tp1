import Ember from 'ember';
import draw from './draw';

export default Ember.Component.extend({
  classNames: ['histogram-chart'],
  attributeBindings: ['style'],
  didInsertElement() {
    draw.bind(this)();
  }
});
