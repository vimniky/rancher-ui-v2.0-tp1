import Ember from 'ember';

export default Ember.Mixin.create({
  _getOptions(fieldName, schemaId, storeName = 'store') {
    const store = this.get(storeName);
    let out = []
    if (!schemaId) {
      schemaId = this.get('model.type');
    }
    try {
      out = store.getById('schema', schemaId).get(`resourceFields.${fieldName}.options`) || [];
    } catch(err) {
      return [];
    }
    return out
  },
  getEnumFieldOptions() {
    return this._getOptions(...arguments).map(option => ({value: option, label: option.capitalize()}));
  },
});
