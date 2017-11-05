import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'pod',
  displayName: function() {
    return this.get('name') || this.get('id');
  }.property('id,name'),
});
