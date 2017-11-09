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
        this.get('tags').push(t);
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
    addTag() {
      this.get('tags').pushObject({
        key: null,
        value: null,
      });
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
