import Ember from 'ember';

export default Ember.Component.extend({
  // input
  groups: null,
  value: null,
  disabled: false,

  // grouped selection content
  choices: null,
  init() {
    this._super(...arguments)
    const groups = this.get('groups')
    if (groups && groups.length) {
      const out = groups.map(
        opt => this
          .get('store')
          .all(opt.type)
          .filter(res => {
            if (typeof opt.filter === 'function') {
              return opt.filter(res);
            }
            return true
          })
          .map(res => ({
            group: opt.group || opt.type,
            value: res.get('id'),
            label: res.get('displayName'),
          }))
      ).reduce((sum, ary) => sum.concat(ary), []);
      this.set('choices', out);
    }
  },
});
