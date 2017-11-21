import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['box'],
  host: '',
  port: '',
  didReceiveAttrs() {
    console.log('received')
    const  hostPort = this.get('emailConfig.smtpSmartHost');
    if (hostPort && typeof hostPort === 'string') {
      const pair = hostPort.split(':');
      this.set('host', pair[0]);
      this.set('port', pair[1]);
    }
  },
  updateSmtpHost: function() {
    console.log('update', this.get('port'), this.get('host'));
    const out = `${this.get('host')}:${this.get('port')}`;
    return this.set('emailConfig.smtpSmartHost', out);
  }.observes('host', 'port'),
});
