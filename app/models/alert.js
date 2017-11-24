import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';
const {getOwner} = Ember;

const TARGET_TYPES = [
  {value: 'node', label: 'node'},
  {value: 'deployment', label: 'deployment'},
  {value: 'statefulset', label: 'statefulset'},
  {value: 'daemonset', label: 'daemonset'},
  {value: 'pod', label: 'pod'},
];

const defaultStateMap = {
  'active':                   {icon: 'icon icon-alert',         color: 'text-error'  },
  'suppressed':               {icon: 'icon icon-alert',         color: 'text-warning'},
  'disabled':                 {icon: 'icon icon-circle',        color: 'text-muted'  },
  'enabled':                  {icon: 'icon icon-circle-o',      color: 'text-success'},
};

var Alert = Resource.extend({
  type: 'alert',

  percent: 30,
  router: Ember.inject.service(),

  cb() {
    this.delete().then((res) => {
      const c = getOwner(this).lookup('controller:alerts.index');
      c.get('model').removeObject(this);
    });
  },

  rules: function() {
    const t = this.get('targetType');
    let rule
    let out;
    switch(t) {
    case 'pod':
      out = 'Pod is unhealthy';
      break;
    case 'node':
      out = `Node is ${(this.get('nodeRuleLabel') || '').toLowerCase()}`;
      break;
    default:
      rule = this.get(`${t}Rule.unavailablePercentage`);
      out = `When ${rule}% are unhealthy`;
    }
    return out
  }.property('serviceRule.unhealthyPercentage,targetType'),

  _startsAt: function() {
    const state = this.get('state');
    if (state === 'enabled' || state === 'disabled') {
      return 'None';
    }
    return moment(this.get('startsAt')).fromNow();
  }.property('startsAt'),

  _endsAt: function() {
    const state = this.get('state');
    if (state === 'enabled' || state === 'disabled') {
      return 'None';
    }
    return moment(this.get('endsAt')).fromNow();
  }.property('endsAt'),

  init() {
    this._super();
    this.setInitialUnavailablePercentage();
    this.setLatestSelectionMap();
    this.set('targetTypes', TARGET_TYPES);
  },

  latestSelectionMap: null,
  setLatestSelectionMap: function() {
    const targetId = this.get('targetId');
    const lsm = this.get('latestSelectionMap');
    if (!lsm) {
      this.set('latestSelectionMap', Ember.Object.create());
    }
    if (targetId) {
      this.set(`latestSelectionMap.${this.get('targetType')}`, targetId);
    }
  }.observes('targetId'),

  targetTypeChanged: function() {
    const p = this.get('percent');
    this.setUnavailablePercentage(p);

    // automatically select the last use target
    const cached = this.get(`latestSelectionMap.${this.get('targetType')}`);
    if (cached) {
      this.set('targetId', cached);
    } else {
      this.set('targetId', null);
    }
    localStorage.setItem('targetType', this.get('targetType'));
  }.observes('targetType', 'percent'),

  setInitialUnavailablePercentage() {
    const p = this.getUnavailablePercentage();
    if (this.get('id') && p) {
      this.set('percent', p);
    }
  },
  displayName: function() {
    return this.get('description') || this.get('id');
  }.property('description','id'),

  setUnavailablePercentage(p) {
    const t = this.get('targetType')
    switch(t) {
    case 'deployment':
      this.set('deploymentRule.unavailablePercentage', p);
      break;
    case 'statefulset':
      this.set('statefulSetRule.unavailablePercentage', p);
      break;
    case 'daemonset':
      this.set('daemonSetRule.unavailablePercentage', p);
      break
    default:
    }
  },

  getUnavailablePercentage() {
    const t = this.get('targetType')
    let p
    switch(t) {
    case 'deployment':
      p = this.get('deploymentRule.unavailablePercentage');
      break;
    case 'statefulset':
      p = this.get('statefulSetRule.unavailablePercentage');
      break;
    case 'daemonset':
      p = this.get('daemonSetRule.unavailablePercentage');
      break
    default:
    }
    return p;
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
    disable() {
      return this.doAction('disable');
    },
    enable() {
      return this.doAction('enable');
    },
    edit: function() {
      this.get('router').transitionTo('alerts.new', { queryParams: { alertId: this.get('id'), upgrade: true }});
    },
    silence() {
      return this.doAction('silence');
    },
    unsilence() {
      return this.doAction('unsilence');
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

    if (defaultStateMap[key] && defaultStateMap[key].color)
    {
      return defaultStateMap[key].color;
    }

    return this.constructor.defaultStateColor;
  }.property('relevantState','isError'),

  availableActions: function() {
    let l = this.get('links');
    const al = this.get('actionLinks');
    const state = this.get('state');
    const canEnable = state === 'disabled' && al.enable;
    const canDisable = state === 'enabled' && al.disable;
    const canSilence = state === 'active' && al.silence;
    const canUnsilence = state === 'suppressed' && al.unsilence;
    const canDelete = state === 'disabled' && !!l.remove;


    return [
      { label: 'action.edit',       icon: 'icon icon-edit',         action: 'edit',         enabled: !!l.update },
      { divider: true },
      { label: 'action.enable',     icon: 'icon icon-trash',        action: 'enable', enabled: canEnable },
      { divider: true },
      { label: 'action.disable',     icon: 'icon icon-trash',        action: 'disable', enabled: canDisable },
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
