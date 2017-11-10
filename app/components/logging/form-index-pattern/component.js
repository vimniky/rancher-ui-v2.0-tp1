import Ember from 'ember';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';

export default Ember.Component.extend(getEnumFieldOptions, {
  intl: Ember.inject.service(),

  init() {
    this._super();
    const dateFormatOptions = this.getEnumFieldOptions('esLogstashDateformat', 'logging', 'loggingStore');
    this.set('dateFormatChoices', dateFormatOptions);
  },
  status: function() {
    let k = STATUS.COUNTCONFIGURED;
    this.set('statusClass', classForStatus(k));
    // return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('tags.@each.key'),
  dateFormatString: function() {
    const fmt = this.get('model.esLogstashDateformat');
    return moment().format(fmt);
  }.property('model.esLogstashDateformat'),
  dateFormatTypeLabel: function() {
    const fmt = this.get('model.esLogstashDateformat');
    switch (fmt) {
    case 'YYYY':
      return 'yearly';
    case 'YYYY.MM':
      return 'monthly';
    case 'YYYY.MM.DD':
      return 'daily';
    default:
      return null;
    }
  }.property('model.esLogstashDateformat'),
  dateFrequenceLabel: function() {
    const fmt = this.get('model.esLogstashDateformat');
    switch (fmt) {
    case 'YYYY':
      return 'year';
    case 'YYYY.MM':
      return 'month';
    case 'YYYY.MM.DD':
      return 'day';
    default:
      return null;
    }
  }.property('model.esLogstashDateformat'),
});
