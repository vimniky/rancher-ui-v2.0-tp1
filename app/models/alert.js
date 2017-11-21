import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var Alert = Resource.extend({
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
  nodeRules: function() {
    return  [
      {
        value: 'NotReady',
        label: 'Not Ready',
      },
      {
        value: 'DiskPressure',
        label: 'Disk Pressure'
      },
      {
        value: 'MemoryPressure',
        label: 'Memory Pressure',
      },
      {
        value: 'OutOfDisk',
        label: 'Out Of Disk'
      },
    ];
  }.property(),
  nodeRuleLabel: function() {
    const found = this.get('nodeRules').filterBy('value', this.get('nodeRule.condition')).get('firstObject');
    return found && found.label;
  }.property('nodeRule.condition'),
  objectName: function() {
    const type = this.get('targetType');
    const id = this.get('targetId');
    let out;
    if (type && id) {
      const object = this.get('store').getById(type, id);
      if (object) {
        out = object.get('name');
      }
    }
    return out || id;
  }.property('targetType,targetId'),
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
    silence() {
      console.log('silence');
    },
    unsilence() {
      console.log('unsilence');
    },
    promptDelete: function() {
      this.get('modalService').toggleModal('confirm-delete', {resources: [this]});
    },
  },
  recipient: function() {
    if (this.get('recipientId')) {
      return this.get('store').getById('recipient', this.get('recipientId'));
    }
    return null;
  }.property('recipientId'),

  // Overriding the stateColor method, cause alert is diffrent for displaying state colors.
  // stateColor: function() {
  //   if ( this.get('isError') ) {
  //     return 'text-error';
  //   }
  //   var map = this.constructor.stateMap;
  //   var key = (this.get('relevantState')||'').toLowerCase();
  //   if ( map && map[key] && map[key].color !== undefined )
  //   {
  //     if ( typeof map[key].color === 'function' )
  //     {
  //       return map[key].color(this);
  //     }
  //     else
  //     {
  //       return map[key].color;
  //     }
  //   }

  //   if ( defaultStateMap[key] && defaultStateMap[key].color )
  //   {
  //     return defaultStateMap[key].color;
  //   }

  //   return this.constructor.defaultStateColor;
  // }.property('relevantState','isError'),

  availableActions: function() {
    let l = this.get('links');
    const al = this.get('actionLinks');
    const state = this.get('state');
    const canActivate = state === 'inactive' && al.activate;
    const canDeactivate = state === 'active' && al.deactivate;
    const canSilence = state === 'alerting' && al.silence;
    const canUnsilence = state === 'silence' && al.unsilence;
    const canDelete = state === 'inactive' && !!l.remove;


    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.activate',     icon: 'icon icon-trash',        action: 'activate', enabled: canActivate },
      { divider: true },
      { label: 'action.deactivate',     icon: 'icon icon-trash',        action: 'deactivate', enabled: canDeactivate },
      { divider: true },
      { label: 'action.unsilence',     icon: 'icon icon-trash',        action: 'unsilence', enabled: canUnsilence },
      { divider: true },
      { label: 'action.silence',     icon: 'icon icon-trash',        action: 'silence', enabled: canSilence },
      { divider: true },
      { label: 'action.unsilence',     icon: 'icon icon-trash',        action: 'unsilence', enabled: canUnsilence },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',        action: 'promptDelete', enabled: canDelete, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi',      enabled: true },
    ];
  }.property('links.{update,remove}'),
});

export default Alert;
