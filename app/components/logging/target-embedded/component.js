import Ember from 'ember';

const types = [
  {
    emResReqCPU: '1',
    emResReqMemory: '2',
    type: 'Small',
  },
  {
    emResReqCPU: '2',
    emResReqMemory: '4',
    type: 'Medium',
  },
  {
    emResReqCPU: '3',
    emResReqMemory: '6',
    type: 'Large',
  },
];

export default Ember.Component.extend({
  classNames: ['target-embedded'],
  types: types,
  init() {
    this._super();
  },
  currentType: null,
  actions: {
    activate(idx) {
      this.set('currentType', types.objectAt(idx));
      Ember.run.schedule('afterRender', () => {
        const $boxes = this.$('.logging-box');
        $boxes.removeClass('active');
        $boxes.eq(idx).addClass('active');
      })
    }
  },
  defaultActiveIdx: null,
  didReceiveAttrs() {
    const model = this.get('model');
    const cpu = model.get('emResReqCPU');
    const mem = model.get('emResReqMemory');
    types.forEach((type, idx) => {
      if (type.emResReqCPU === cpu && type.emResReqMemory === mem) {
        this.set('defaultActiveIdx', idx);
      }
    });
  },
  updateModel: function() {
    const cpu = this.get('currentType.emResReqCPU');
    const mem = this.get('currentType.emResReqMemory');
    this.set('model.emResReqCPU', cpu);
    this.set('model.emResReqMemory', mem);
  }.observes('currentType.{emResReqCPU,emResReqMemory}'),
});
