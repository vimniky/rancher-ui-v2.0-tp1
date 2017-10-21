import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  originalModel: null,
  justCreated: false,
  actions: {
    save(cb) {
      Ember.RSVP.resolve(this.willSave()).then(ok => {
        this.doSave()
          .then(this.didSave.bind(this))
          .then(this.doneSaving.bind(this))
          .catch((err) => {
            this.send('error', err);
            this.errorSaving(err);
          }).finally(() => {
            cb(true);
          });
      });
    },
    cancel() {
      // after saved/created todo
    }
  },
  didReceiveAttrs() {
    this.set('clone', this.get('originalModel').clone());
    this.set('model', this.get('originalModel').clone());
    this.set('justCreated', false);
  },
  didInsertElement() {
    Ember.run.later(() => {
      this.$('INPUT[type="text"]')[0].focus();
    }, 250);
  },
  editing: function() {
    return !!this.get('clone.id');
  }.property('clone.id'),
  doneSaving: function(neu) {
    if (this.get('editing')) {
      this.send('cancel');
    }
    else {
      this.setProperties({
        justCreated: true,
        clone: neu.clone()
      });
    }
  },
});
