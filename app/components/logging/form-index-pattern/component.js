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
    let k = STATUS.STANDARD;
    const om = this.get('originalModel');
    const prefix = om.get('esLogstashPrefix');
    const format = om.get('esLogstashDateformat');
    const p = this.get('model.esLogstashPrefix');
    const f = this.get('model.esLogstashDateformat');
    if (!prefix) {
      k = STATUS.INCOMPLETE;
    }
    if (prefix !== p || format !== f) {
      k = STATUS.CONFIGURED;
    }
    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`);
  }.property('model.{esLogstashDateformat,esLogstashPrefix}', 'originalModel.{esLogstashDateformat,esLogstashPrefix}'),

  dateFormatString: function() {
    const fmt = this.get('model.esLogstashDateformat');
    return moment().format(fmt);
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
