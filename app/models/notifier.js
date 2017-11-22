import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'notifier',
  slackConfigured: function() {
    return this.get('slackConfig.slackApiUrl');
  }.property('slackConfig.slackApiUrl'),

  emailConfigured: function() {
    return this.get('emailConfig.smtpAuthPassword')
      && this.get('emailConfig.emailApiUrl')
      && this.get('emailConfig.emailAuthUsername');
  }.property('emailConfig.{smtpAuthPassword,emailAuthUsername,emailApiUrl}'),
});
