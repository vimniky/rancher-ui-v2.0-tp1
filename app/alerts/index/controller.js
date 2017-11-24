import Ember from 'ember';
export default Ember.Controller.extend({
  access: Ember.inject.service(),
  modalService: Ember.inject.service('modal'),

  sortBy: 'name',
  queryParams: ['alertState'],
  alertState: 'all',

  actions: {
    showConfigureModal() {
      this.get('modalService').toggleModal('modal-alert-configuration', {
        closeWithOutsideClick: false,
        model: this.get('model.notifier'),
      });
    },
  }
});
