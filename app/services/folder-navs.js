import Ember from 'ember';
import config from '../config/environment';


export default Ember.Service.extend({
  userAuth : Ember.inject.service(),
  internalState : Ember.inject.service(),

  getFolderNavs: function () {
    var thisUserID = this.get('userAuth').getCurrentUserID();

    return [
      {
        name : "Home",
        command : "home",
        parentId: thisUserID,
        parentType : "user",
        icon : "home",
        isFolder :  true
      },
      {
        name : "Data",
        command : "registered",
        parentId : null,
        parentType : null,
        icon : "file",
        options : {
          adapterOptions:{registered: true}
        },
        isFolder :  false
      },
      {
        name : "Workspace",
        command : "workspace",
        parentId : null,          //TODO: Find out what the parent is
        parentType : null,
        icon : "folder",
        isFolder :  false         //TODO: Find out whether this is an actual folder
      },
      {
        name : "Recent",
        command : "recent",
        parentId : null,
        parentType : null,
        icon : "calendar",
        isFolder :  false
      }

    ];
    },
    getFolderNavFor: function (navCommand) {
      var navs = this.getFolderNavs();
      //console.log(navs);

      for (var i=0; i< navs.length; ++i) {
        //console.log(navs[i]);
        if (navs[i].command === navCommand) return navs[i];
      }
      return null;
    },
    getCurrentFolderNavAndSetOn: function (obj) {
      var navCommand  = this.get('internalState').getCurrentNavCommand();
      console.log("Nav Command = " + navCommand);
      var currentNav = this.getFolderNavFor(navCommand);
      obj.set("currentNavCommand", navCommand);
      return currentNav;
    }


  });


