import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
import PolledResource from 'ui/mixins/cattle-polled-resource';

const defaultStateMap = {
  'inactive': {icon: 'icon icon-tag', color: 'text-muted'},
  'active': {icon: 'icon icon-tag', color: 'text-error'},
};

var Alert = Resource.extend(PolledResource, {
  type: 'alert',
  router: Ember.inject.service(),
  // Todo: why I need to do this? the resouce should be deleted(remove from the store) anyway after
  // resource.delete() called.
  // If resouces have a cb method on it, cb will be called when user `confirm deletion`.
  cb() {
    this.delete().then(() => {
      this.get('store')._remove('alert', this);
    });
  },
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
  recipient: function() {
    if (this.get('recipientId')) {
      return this.get('store').getById('recipient', this.get('recipientId'));
    }
    return null;
  }.property('recipientId'),
  // Overriding the stateColor method, cause alert is diffrent for displaying state colors.
  stateColor: function() {
    if ( this.get('isError') ) {
      return 'text-error';
    }
    var map = this.constructor.stateMap;
    var key = (this.get('relevantState')||'').toLowerCase();
    if ( map && map[key] && map[key].color !== undefined )
    {
      if ( typeof map[key].color === 'function' )
      {
        return map[key].color(this);
      }
      else
      {
        return map[key].color;
      }
    }

    if ( defaultStateMap[key] && defaultStateMap[key].color )
    {
      return defaultStateMap[key].color;
    }

    return this.constructor.defaultStateColor;
  }.property('relevantState','isError'),
  availableActions: function() {
    let l = this.get('links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('links.{update,remove}'),
});

Alert.reopenClass({
  pollTransitioningDelay: 1000,
  pollTransitioningInterval: 5000,
});

export default Alert;
