import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),
  classNames: ['accordion-wrapper'],

  expandAll: null,
  items: null,
  value: null,
  localizedKeyLabel: false,
  localizedValueLabel: false,
  addButtonLabel: 'Add',

  keyLabel: 'Key',
  valueLabel: 'Value',
  buttonPosition: 'bottom-right',
  minItems: 0,

  init() {
    this._super();
    if (!this.get('items')) {
      this.set('items', []);
    }
    if (typeof this.get('value') !== 'string') {
      this.set('value', '');
    }
    const keyValueStrAry = this.get('value').trim().split(',').filter(str => !!str);
    if (keyValueStrAry) {
      keyValueStrAry.sort().forEach(keyValueStr => {
        const [key, value] = keyValueStr.split(':');
        const out = {
          key: key,
          value: value,
        }
        this.get('items').pushObject(Ember.Object.create(out));
      });
    }
  },

  disableDelete: function() {
    console.log(this.get('items.length'))
    return this.get('minItems') >= this.get('items.length');
  }.property('minItems','items.length'),

  didReceiveAttrs() {
    const len = this.get('items.length') || 0;
    const minItems = this.get('minItems')
    if (len < minItems) {
      let diff = minItems - len;
      while (diff--) {
        this.send('addItem');
      }
    }
  },
  setValue: function() {
    const value = this
          .get('items')
          // key and value are both must not empty
          .filter(item => !!item.key && !!item.value)
          .map(item => `${item.get('key') || ''}:${item.get('value') || ''}`)
          .join(',');
    this.set('value', value);
  }.observes('items.@each.{key,value}'),

  actions: {
    pastedItems(str, target) {
      let items = this.get('items');
      str = str.trim();
      if (str.indexOf('=') === -1 && str.indexOf(':') === -1) {
        // Just pasting a key
        $(target).val(str);
        return;
      }

      let lines = str.split(/\r?\n/);
      lines.forEach((line) => {
        line = line.trim();
        if (!line) {
          return;
        }

        let idx = line.indexOf('=');
        if ( idx === -1 ) {
          idx = line.indexOf(':');
        }

        let key = '';
        let val = '';
        if (idx > 0) {
          key = line.substr(0,idx).trim();
          val = line.substr(idx+1).trim();
        }
        else {
          key = line.trim();
          val = '';
        }
        let existing = items.filterBy('key',key)[0];
        if (existing) {
          Ember.set(existing,'value',val);
        }
        else {
          items.pushObject(Ember.Object.create({key: key, value: val}));
        }
      });

      // Clean up empty user entries
      let toRemove = [];
      items.forEach((item) => {
        if (!item.get('key') && !item.get('value')) {
          toRemove.push(item);
        }
      });
      items.removeObjects(toRemove);
    },
    addItem() {
      this.get('items').pushObject(Ember.Object.create({key: null, value: null}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }
        this.$('INPUT.key').last()[0].focus();
      });
    },
    removeItem(item) {
      this.get('items').removeObject(item);
    }
  },
});
