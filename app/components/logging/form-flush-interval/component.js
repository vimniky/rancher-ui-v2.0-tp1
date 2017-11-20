import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend({
  intl: Ember.inject.service(),

  status: function() {
    let k = STATUS.STANDARD;
    const flusshInterval = this.get('flushInterval');
    const originalFlushInterval = this.get('originalFlushInterval');
    if (!flusshInterval) {
      k = STATUS.INCOMPLETE;
    }
    if (+flusshInterval !== +originalFlushInterval) {
      k = STATUS.CONFIGURED;
    }
    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('flushInterval', 'originalFlushInterval'),
});
