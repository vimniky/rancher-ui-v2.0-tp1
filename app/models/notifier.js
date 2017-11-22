import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'notifier',
  slackConfigured: function() {
    return !!this.get('slackConfig.slackApiUrl');
  }.property('slackConfig.slackApiUrl'),

  emailConfigured: function() {
    const p = this.get('emailConfig.smtpAuthPassword');
    const h = this.get('emailConfig.smtpSmartHost');
    const n = this.get('emailConfig.smtpAuthUsername');
    return !!p && !!h && !!n;
  }.property('emailConfig.{smtpAuthPassword,smtpAuthUsername,smtpSmartHost}'),
});
