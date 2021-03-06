import Component from '@ember/component';
import { inject as service } from '@ember/service';
import FullScreenMixin from 'ember-cli-full-screen/mixins/full-screen';
import config from '../../../../config/environment';
import { scheduleOnce } from '@ember/runloop';
import { computed } from '@ember/object';
import $ from 'jquery';

export default Component.extend(FullScreenMixin, {
  router: service('-routing'),
  internalState: service(),
  loadError: false,
  model: null,
  wholeTaleHost: config.wholeTaleHost,

  init() {
    this._super(...arguments);
    this.result = {
      CouldNotLoadUrl: 1,
      UrlLoadedButContentCannotBeAccessed: 2,
      UrlLoadedContentCanBeAccessed: 3
    };
  },

  didRender() {
    // Similar to Jquery on page load
    // doesn't work because of the handlebars. But even if you unhide the element, the iframes show
    // that they load ok even though some are blocked and some are not.
    let frame = document.getElementById('frontendDisplay');
    if (frame) {
      frame.onload = () => {
        let iframeWindow = frame.contentWindow;
        // let that = $(this)[0]; // commented because was never used

        window.addEventListener("message", function (event) {
          if (event.origin !== window.location.origin) {
            // something from an unknown domain, let's ignore it
            return;
          }
        }, false);

        iframeWindow.parent.postMessage('message sent', window.location.origin);
      };
    }

  },

  didInsertElement() {
    scheduleOnce('afterRender', this, () => {
      // Check if we're coming from an ORCID redirect
      // If ?auth=true
      // Open Modal
      const modalDialogName = 'ui/files/publish-modal';
      this.showModal(modalDialogName, this.get('modalContext'));
    });
  },

  getDataONEJWT() {
    /*
    Queries the DataONE `token` endpoint for the jwt. When a user signs into
    DataONE a cookie is created, which is checked by `token`. If the cookie wasn't
    found, then the response will be empty. Otherwise the jwt is returned.
    */

    // Use the XMLHttpRequest to handle the request
    let xmlHttp = new XMLHttpRequest();
    // Open the request to the the token endpoint, which will return the jwt if logged in
    xmlHttp.open("GET", 'https://cn-stage-2.test.dataone.org/portal/token', false);
    // Set the response content type
    xmlHttp.setRequestHeader("Content-Type", "text/xml");
    // Let XMLHttpRequest know to use cookies
    xmlHttp.withCredentials = true;
    xmlHttp.send(null);
    return xmlHttp.responseText;
  },

  hasD1JWT: computed('model.taleId', function () {
    let jwt = this.getDataONEJWT();
    return jwt ? true : false;
  }),

  showModal(modalDialogName, modalContext) {
    // Open Publish Modal
    this.sendAction('publishTale', modalDialogName, modalContext);
  },

  publishModalContext: computed('model.taleId', function() {
    return { taleId: this.get('model.taleId'), hasD1JWT: this.hasD1JWT };
  }),

  actions: {
    stop() {
      this.set("model", null);
    },

    publishTale(modalDialogName, modalContext) {
      // Open Modal
      this.get('showModal')(modalDialogName, modalContext);
    },

    denyDataONE() {
      return true;
    },

    authenticateD1(taleId) {
      let callback = `${this.get('wholeTaleHost')}/run/${taleId}?auth=true`;
      let orcidLogin = 'https://cn-stage-2.test.dataone.org/portal/oauth?action=start&target=';
      window.location.replace(orcidLogin + callback);
    },

    openDeleteModal(id) {
      let selector = '.ui.' + id + '.modal';
      $(selector).modal('show');
    },

    approveDelete(model) {
      model.deleteRecord();
      model.save();
      this.get('router').transitionTo('run');
      return false;
    },

    denyDelete() {
      return true;
    }

  }
});
