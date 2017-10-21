import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

var Alert = Resource.extend(PolledResource, {
  type: 'alert',
  router: Ember.inject.service(),
  actions: {
    deactivate() {
      return this.doAction('deactivate');
    },
    activate() {
      return this.doAction('activate');
    },
    edit: function() {
      this.get('router').transitionTo('alerts.new', { queryParams: { alertId: this.get('id'), upgrade: true }});
    },
  },

  availableActions: function() {
    let a = this.get('actionLinks');
    let l = this.get('links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',   icon: 'icon icon-play',         action: 'activate',     enabled: !!a.activate },
      { label: 'action.deactivate', icon: 'icon icon-pause',        action: 'deactivate',   enabled: !!a.deactivate },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('actionLinks.{activate,deactivate,restore}','links.{update,remove}'),
});

Alert.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Alert;
