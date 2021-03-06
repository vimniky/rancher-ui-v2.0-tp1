import Ember from 'ember';
import C from 'ui/utils/constants';
import {get as getTree} from 'ui/utils/navigation-tree';
import HoverDropdown from 'ui/mixins/hover-dropdowns';

function fnOrValue(val, ctx) {
  if ( typeof val === 'function' )
  {
    return val.call(ctx);
  }
  else
  {
    return val;
  }
}


export default Ember.Component.extend(HoverDropdown, {
  // Inputs
  stacks               : null,

  // Injections
  intl                 : Ember.inject.service(),
  projects             : Ember.inject.service(),
  settings             : Ember.inject.service(),
  access               : Ember.inject.service(),
  prefs                : Ember.inject.service(),

  clusterId            : Ember.computed.alias('projects.currentCluster.id'),
  cluster              : Ember.computed.alias('projects.currentCluster'),
  projectId            : Ember.computed.alias('projects.current.id'),
  project              : Ember.computed.alias('projects.current'),
  isAdmin              : Ember.computed.alias('access.admin'),
  isCaas               : Ember.computed.equal('app.mode',C.MODE.CAAS),
  isOss                : Ember.computed.equal('app.mode',C.MODE.OSS),
  accessEnabled        : Ember.computed.alias('access.enabled'),

  // Component options
  tagName              : 'header',
  classNames           : ['page-header'],
  dropdownSelector     : '.navbar .dropdown',

  actions: {
    switchProject(id) {
      this.sendAction('switchProject', id);
    },
  },

  willRender() {
    if (Ember.$('BODY').hasClass('touch') && Ember.$('header > nav').hasClass('nav-open')) {
      Ember.run.later(() => {
        Ember.$('header > nav').removeClass('nav-open');
      });
    }
  },

  init() {
    this._super(...arguments);
    this.get('intl.locale');
    this.set('stacks', this.get('store').all('stack'));
    this.set('hosts', this.get('store').all('host'));
    this.set('stackSchema', this.get('store').getById('schema','stack'));

    const loggingAuth = this.get('loggingStore').all('loggingAuth').get('firstObject')
    this.set('loggingAuth', loggingAuth);

    this.updateNavTree();
    Ember.run.scheduleOnce('render', () => {
      //responsive nav 63-87
      var responsiveNav = document.getElementById('js-responsive-nav');

      var toggleBtn = document.createElement('a');
      toggleBtn.setAttribute('class', 'nav-toggle');
      responsiveNav.insertBefore(toggleBtn, responsiveNav.firstChild);

      function hasClass(e,t){return(new RegExp(' '+t+' ')).test(' '+e.className+' ')}

      function toggleClass(e,t){var n=' '+e.className.replace(/[\t\r\n]/g,' ')+' ';if(hasClass(e,t)){while(n.indexOf(' '+t+' ')>=0){n=n.replace(' '+t+' ',' ')}e.className=n.replace(/^\s+|\s+$/g,'')}else{e.className+=' '+t}}

      toggleBtn.onclick = function() {
          toggleClass(this.parentNode, 'nav-open');
      }

      var root = document.documentElement;
      root.className = root.className + ' js';
    });
  },

  // This computed property generates the active list of choices to display
  navTree: null,
  updateNavTree() {
    let currentScope = this.get('scope');

    let out = getTree().filter((item) => {
      if ( typeof item.condition === 'function' )
      {
        if ( !item.condition.call(this) )
        {
          return false;
        }
      }

      if ( item.scope && item.scope !== currentScope ) {
        return false;
      }

      item.localizedLabel = fnOrValue(item.localizedLabel, this);
      item.label = fnOrValue(item.label, this);
      item.route = fnOrValue(item.route, this);
      item.ctx = (item.ctx||[]).map((prop) => {
        return fnOrValue(prop, this);
      });
      item.submenu = fnOrValue(item.submenu, this);

      item.submenu = (item.submenu||[]).filter((subitem) => {
        if ( typeof subitem.condition === 'function' && !subitem.condition.call(this) ) {
          return false;
        }

        subitem.localizedLabel = fnOrValue(subitem.localizedLabel, this);
        subitem.label = fnOrValue(subitem.label, this);
        subitem.route = fnOrValue(subitem.route, this);
        subitem.ctx = (subitem.ctx||[]).map((prop) => {
          return fnOrValue(prop, this);
        });

        const ns = this.get('projects.current').name.toLowerCase();
        const isClusterLevel = ns === 'system';
        if (subitem.id === 'tools-logging') {
          return isClusterLevel || this.get('loggingAuth.enableNamespaceLogging');
        }
        if (subitem.id === 'tools-notifiers') {
          return isClusterLevel;
        }

        return true;
      });

      return true;
    });

    this.set('navTree', out);
  },
  shouldUpdateNavTree: function() {
    Ember.run.scheduleOnce('afterRender', this, 'updateNavTree');
  }.observes(
    'scope',
    'projectId',
    'stacks.@each.group',
    `prefs.${C.PREFS.ACCESS_WARNING}`,
    'access.enabled',
    'isAdmin',
    'intl.locale',
    'projects.current.name',
    'loggingAuth.enableNamespaceLogging'
  ),

  // Utilities you can use in the condition() function to decide if an item is shown or hidden,
  // beyond things listed in "Inputs"
  hasProject: function() {
    return !!this.get('project');
  }.property('project'),

  // Hackery: You're an owner if you can write to the 'system' field of a stack
  isOwner: function() {
    return !!this.get('stackSchema.resourceFields.system.update');
  }.property('stackSchema.resourceFields.system.update'),
});
