import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default Ember.Controller.extend({
  edit_text:null,
  isEditable: false,
  init() {
  },

  valueObserver : Ember.observer("model", function (sender, key, value) {
    console.log("Controller observer hook is called from nested 'edit'");
    var model = this.get('model');
    console.log(model);

    var me=this;
    var itemID = model.get('_id');
    var size = model.get('size');

    if (size < 1000000) {
      console.log("File loading " + model.get('name'));
      var url = 'https://girder.wholetale.org/api/v1/item/' + itemID + '/download?contentDisposition=attachment';
      var client = new XMLHttpRequest();
      client.open('GET', url);
      client.onreadystatechange = function() {
        me.set("edit_text", client.responseText);
        me.set("isEditable", true);
      };
      client.send();
    }
  }),

actions: {
    download: function(itemID, itemName, ) {
    },
  textUpdated: function(newVal) {
    this.set('textContents', newVal);
  },
  updateTextFile : function () {
    // do something with

    console.log(this.get('textContents'));

  }

  }

});
