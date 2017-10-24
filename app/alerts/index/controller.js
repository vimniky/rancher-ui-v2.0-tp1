import Ember from 'ember';
export default Ember.Controller.extend({
  access: Ember.inject.service(),
  sortBy: 'name',
  queryParams: ['alertState'],
  alertState: 'all',
});
