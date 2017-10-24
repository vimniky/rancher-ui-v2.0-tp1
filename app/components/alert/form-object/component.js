import Ember from 'ember';

export default Ember.Component.extend({
  // input
  types: [],
  // type filter
  type: null,
  value: null,
  disabled: false,

  objectIdChange: function() {
  }.observes('value'),
  // grouped selection content
  choices: function() {
    const type = this.get('type');
    const types = this.get('types').filter(typeOpt => {
      if (!type) {
        return true;
      }
      return typeOpt.type === type;
    });
    let out = [];
    if (types && types.length) {
      out = types.map(
        opt => this
          .get(opt.storeName || 'store')
          .all(opt.type)
          .filter(res => {
            if (typeof opt.filter === 'function') {
              return opt.filter(res);
            }
            return true
          })
          .map(res => {
            const vp = opt.optionValuePath;
            const lp = opt.optionLabelPath;
            const value = vp ? res.get(vp) : res.id;
            const label = lp ? res.get(lp) : res.get('displayName');
            const group = this.get('grouping') ? opt.group || opt.type : null;
            return {
              group,
              value,
              label,
            };
          })
      ).reduce((sum, ary) => sum.concat(ary), []);
    }
    return out;
  }.property('types.[],type'),
  init() {
    this._super();
  }
});
