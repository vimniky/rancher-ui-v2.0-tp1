import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  classNames: ['generic', 'medium-modal'],

  model: Ember.computed.alias('modalService.modalOpts.model'),

  errors: null,

  validate() {
    const errors = this.get('model').validationErrors();
    if (errors.get('length')) {
      this.set('errors', errors);
      return false;
    }
    this.set('errors', null);
    return true;
  },

  actions: {
    save(cb) {
      const ok = this.validate();
      if (!ok) {
        cb();
        return;
      }
      const model = this.get('model');
      model.save().then(newData => {
        model.merge(newData);
        this.get('modalService').toggleModal();
      }).catch(error => {
        this.set('errors', [error && error.message]);
      }).finally(() => {
        cb();
      });
    },
  },
});
