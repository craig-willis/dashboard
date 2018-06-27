import Ember from 'ember';
import {
  computed
} from '@ember/object';

export default Ember.Component.extend({
  apiCall: Ember.inject.service('api-call'),
  wtEvents: Ember.inject.service(),
  store: Ember.inject.service(),
  router: Ember.inject.service(),

  inputData: Ember.A(),
  selectedEnvironment: Ember.Object.create({}),
  newTaleName: '',
  message: 'Launching new Tale, please wait.',
  launchingInstance: false,

  invalidNewTale: computed('inputData', 'selectedEnvironment', 'newTaleName', 'inputData.length', function () {
    let hasName = Boolean(this.get('newTaleName') && this.get('newTaleName').length);
    let hasEnvironment = Boolean(this.get('selectedEnvironment') && this.get('selectedEnvironment').id);
    if(!this.get('inputData')) {
      this.set('inputData', Ember.A());
    }
    // let hasData = Boolean(this.get('inputData') && this.get('inputData').length);
    return !(hasName && hasEnvironment);
  }),

  init() {
    this._super(...arguments);
    let events = this.get('wtEvents').events;
    const self = this;
    if (self.isDestroyed) {
      return;
    }
    events.on('select', function (allSelected) {
      self.set('inputData', allSelected);
    });
    events.on('selectEnvironment', function (selectedEnvironment) {
      self.set('selectedEnvironment', selectedEnvironment);
    });
  },

  // just checking the toggle works ...
  publicCheckedObserver: Ember.observer('public_checked', function () {
    console.log("Checked = " + this.get('public_checked'));
  }),

  publicDescriptionObserver: Ember.observer('description', function () {
    console.log("Description = " + this.get('description'));
  }),

  // public_checked : false,
  tale_creating: false,
  tale_created: false,
  configuration: JSON.stringify({}),

  clearForm() {
    this.set('selectedEnvironment', null);
    this.set('inputData', Ember.A());
    this.set('tale_creating', false);
    this.set('tale_created', false);
    this.set('launchingInstance', false);
    this.set('configuration', JSON.stringify({}));
  },

  launchTale(tale) {
    let component = this;

    let onSuccess = function (item) {
      const instance = Ember.Object.create(JSON.parse(item));
      const instanceId = instance._id;
      console.log(`Launching new instance with id: ${instanceId}`);
      Ember.run.later((function () {
        component.set('launchingInstance', false);
        component.get('router').transitionTo('run.view', instanceId);
      }), 1000);
    };

    let onFail = function (item) {
      // deal with the failure here
      item = JSON.parse(item);
      console.log(`Launching new instance ${item} threw some errors`);
    };

    // submit: API
    // httpCommand, taleid, imageId, folderId, instanceId, name, description, isPublic, config

    component.get("apiCall").postInstance(
      tale.get("_id"),
      tale.get("imageId"),
      null,
      onSuccess,
      onFail);
    
    component.set('launchingInstance', true);
  },

  actions: {
    // this is called when someone selected the front end image/environment
    selectEnvironment(model) {
      console.log(model.get('name') + " frontend image has been selected in compose.js...");
      this.set("selectedEnvironment", model);
    },

    //   Launch new Tale functionality
    createTale() {
      let component = this;

      let onSuccess = function (item) {
        component.launchTale(item);
      };

      let onFail = function (e) {
        // deal with the failure here
        console.log(e);
      };

      let data = this.get('inputData') || {};
      let formattedData = [];
      data.forEach(x => {
        formattedData.push({
          'type': x.get('isFolder') ? 'folder' : 'item',
          'id': x.get('id')
        });
      });

      let new_tale = this.get('store').createRecord('tale', {
        "config": {}, //TODO: Implement configuration editor
        "involatileData": formattedData,
        "imageId": this.get('selectedEnvironment').get('_id'),
        "title": this.get('newTaleName')
      });

      new_tale.save().then(onSuccess).catch(onFail);
    }
  }
});
