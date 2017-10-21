import Ember from 'ember';
import ThrottledResize from 'ui/mixins/throttled-resize';

export default Ember.Component.extend(ThrottledResize, {
  classNames: ['stats-bars'],
  resizeInterval: 50,
  fullWidth: 100,
  height: 8,
  name: 'Containers',
  data: [
    Ember.Object.create({bgColor: 'bg-info', value: 10}),
    Ember.Object.create({bgColor: 'bg-success', value: 8}),
    Ember.Object.create({bgColor: 'bg-warning', value: 7}),
    Ember.Object.create({bgColor: 'bg-error', value: 5}),
  ],
  init() {
    this._super(...arguments);
  },
  total: function() {
    return this.get('data').reduce((total, bar) => total + bar.value, 0)
  }.property('stats.@each.value'),
  didInsertElement() {
    this._resize()
  },
  _resize() {
    const width = this.$('.bars').width();
    this.set('fullWidth', width - 40);
  },
  onResize() {
    this._resize()
  },
  bars: function() {
    const out = this.get('data').map(bar => {
      const fullWidth = this.get('fullWidth');
      const total = this.get('total');
      const width = Ember.String.htmlSafe((bar.value / total * fullWidth) + 'px');
      const height = Ember.String.htmlSafe(this.get('height') + 'px');
      return {
        bgColor: bar.bgColor,
        css: Ember.String.htmlSafe(`width: ${width}; height: ${height};`),
      }
    });
    return out
  }.property('data', 'data.[]', 'fullWidth')
});
