import Ember from 'ember';
import Resolver from './resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
import './models/custom-inflector-rules';
import moment from 'moment';

let App;

Ember.MODEL_FACTORY_INJECTIONS = true;

App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver
});


loadInitializers(App, config.modulePrefix);

console.log("The app is running in " + config.environment + " mode");
console.log("The API is " + config.apiUrl);
export default App;
