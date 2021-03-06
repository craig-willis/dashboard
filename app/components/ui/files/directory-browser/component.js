import Component from '@ember/component';
import config from '../../../../config/environment';
import layout from './template';
import {
  inject as service
} from '@ember/service';
import $ from 'jquery';

export default Component.extend({
  layout,

  store: service(),
  internalState: service(),

  apiUrl: config.apiUrl,

  showEditor: false,

  selectedItem: null,
  renaming: false,
  confirmDisabled: "disabled",

  didRender() {
    if (this.renaming) {
      var timer;

      let self = this;
      let cancelRenaming = function () {
        self.set("renaming", false);
        self.selectedItem.rollbackAttributes();
      };

      let input = $('#txt-renaming');

      input.focus();

      input.on("blur", function () {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(cancelRenaming, 200);
      });
    }

  },

  actions: {
    clickedFolder(item, event) {
      let evt = event || window.event;
      if (!evt.ctrlKey) {
        this.onItemClicked(item, "true");
      }
    },

    clickedFile(item) {
      this.onItemClicked(item, "false");
    },

    updateModel(file) {
      let attrs = file.changedAttributes();
      let keys = Object.keys(attrs);
      let queryParams = keys.reduce((_q, key) => {
        let from = attrs[key][0];
        let to = attrs[key][1];
        if (from === to) return _q;
        _q[key] = to;
        return _q;
      }, {});
      this.set('renaming', false);
      file.save({
        adapterOptions: {
          queryParams: queryParams
        }
      });
    },

    share(file) {
      const state = this.get('internalState');
      state.setACLObject(file);
      let modalElem = $('.acl-component');
      if (modalElem) {
        modalElem.modal('show');
        if (modalElem.hasClass("scrolling")) {
          modalElem.removeClass("scrolling");
        }
      }
    },

    move(file) {
      let disallowed = this.get('currentNav').command === 'home' ? 'Data' : 'Home';
      this.set('disallowed', disallowed);
      this.set('fileToMove', file);
      $('.ui.modal.destinate-folder').modal('show');
    },

    moveFile(fileToMove, moveTo) {
      let self = this;

      // let queryParams = {folderId: moveTo.get('id')};
      let queryParams = {};
      if (fileToMove.get("_modelType") === "folder") {
        queryParams['parentType'] = moveTo.get('_modelType');
        queryParams['parentId'] = moveTo.get('id');
      } else {
        queryParams['folderId'] = moveTo.get('id');
      }

      this.fileToMove.save({
        adapterOptions: {
          queryParams: queryParams
        }
      }).then(() => {
        if (self.fileList) self.set('fileList', self.fileList.reject(item => {
          return item.id === fileToMove.id;
        }));
        if (self.folderList) self.set('folderList', self.folderList.reject(item => {
          return item.id === fileToMove.id;
        }));
      });
    },

    rename(file) {
      this.set('renaming', file.id);
      this.set('selectedItem', file);
    },

    copy(file) {
      let self = this;
      let store = this.get('store');

      let fileType = file.get('_modelType');

      let copy = store.createRecord(fileType, {});
      copy.save({
          adapterOptions: {
            copy: file.id
          }
        })
        .then(copy => {
          if (fileType === "item") {
            self.set('fileList', [copy].pushObjects(self.fileList.toArray()).sortBy('name'));
          } else if (fileType === "folder") {
            self.set('folderList', [copy].pushObjects(self.folderList.toArray()).sortBy('name'));
          }
        });
    },

    remove(file) {
      this.get('internalState').removeFolderFromRecentFolders(file.id);
      file.destroyRecord();
    },

    confirmedRemove() {
      $("#confirm-remove").addClass("hidden");
      let state = this.get('internalState');
      state.removeFolderFromRecentFolders(this.fileToRemove.id);
      this.fileToRemove.destroyRecord();
    },

    closedPrompt(prompt) {
      $(prompt).addClass("hidden");
    },

    confirmValueEquals(value) {
      if (this.confirmValue === value) {
        this.set('confirmDisabled', '');
      } else {
        this.set('confirmDisabled', 'disabled');
      }
    }
  }
});
