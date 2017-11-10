import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  classNames: ['accordion-wrapper'],
  expandAll: null,
  tags: null,

  init() {
    this._super();
    if (!this.get('tags')) {
      this.set('tags', []);
    }
    const it = this.get('initialTags');
    if (it) {
      Object.keys(it).sort().forEach(key => {
        const t = {
          key,
          value: it[key],
        }
        this.get('tags').pushObject(Ember.Object.create(t));
      });
    }
  },

  didReceiveAttrs() {
    if (!this.get('expandFn')) {
      this.set('expandFn', function(item) {
        item.toggleProperty('expanded');
      });
    }
  },

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = this.get('tags').filterBy('key').get('length') || 0;

    if ( count ) {
      k = STATUS.COUNTCONFIGURED;
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('tags.@each.key'),

  actions: {
    pastedTags(str, target) {
      let ary = this.get('tags');
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
        let existing = ary.filterBy('key',key)[0];
        if (existing) {
          Ember.set(existing,'value',val);
        }
        else {
          ary.pushObject(Ember.Object.create({key: key, value: val}));
        }
      });

      // Clean up empty user entries
      let toRemove = [];
      ary.forEach((item) => {
        if (!item.get('key') && !item.get('value')) {
          toRemove.push(item);
        }
      });
      ary.removeObjects(toRemove);
    },
    addTag() {
      this.get('tags').pushObject(Ember.Object.create({key: null, value: null}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }
        this.$('INPUT.key').last()[0].focus();
      });
    },
    removeTag(tag) {
      this.get('tags').removeObject(tag);
    }
  },
});
