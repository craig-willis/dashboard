import Ember from 'ember';
import ResetScroll from 'wholetale/mixins/reset-scroll';

export default Ember.Route.extend(ResetScroll, {
  activate: function() {
    // this mixin moves the page up to the top - removes the current scroll
    this._super.apply(this, arguments);
  },
    init() {
      console.log("In the route for the view in upload");
    },

    afterModel : function(model, transition) {
      console.log("In the afterModel hook in route for the view in upload");
      console.log(model);
      this.set('pass_model', model);

      console.log(transition);
      var me=this;

    },

    model(params, transition) {
      var fileId;

      console.log("In the file edit route and params is" );
      console.log(params);

      if (params.hasOwnProperty("file_id"))
        fileId = params.file_id;
      else
        fileId = transition.params['upload.edit'].file_id;

      console.log("The fieldID " + fileId);

      var fileObj = this.store.findRecord('item', fileId);

      console.log(fileObj);
      return fileObj;
    },
  setupController: function(controller) {
    console.log("Setup Controller in the route for view" );

    var model = this.get('pass_model');
    this.set('model', model);
    this._super(controller, model);
    controller.set('model', model);
  }

});
