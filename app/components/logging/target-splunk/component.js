import Ember from 'ember';
import getEnumFieldOptions from 'ui/mixins/get-enum-field-options';


export default Ember.Component.extend(getEnumFieldOptions, {

  protocolChoices: null,
  timeFormatChoices: null,

  init() {
    this._super();
    this.set('protocolChoices', this.getEnumFieldOptions('splunkProtocol', 'logging', 'loggingStore'));
    this.set('timeFormatChoices', this.getEnumFieldOptions('splunkTimeFormat', 'logging', 'loggingStore'));
  },
});
