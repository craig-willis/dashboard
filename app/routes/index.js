import Ember from 'ember';


import AuthenticateRoute from 'wholetale/routes/authenticate';

export default AuthenticateRoute.extend({
  userAuth: Ember.inject.service(),

  model() {
      let currentUserId = this.get('userAuth').getCurrentUserID();

      let catalogItems = {
          mine: Ember.A(),
          used: Ember.A(),
          all:  Ember.A()
      };

      var route=this;

      return this.get('store').query('dataset', {})
          .then(registered => {

            registered.forEach(function(model) {
              var creatorId = model.get('creatorId');
              var userName = "System";
              if (creatorId !=null) {
                var user = route.get('store').findRecord("user", creatorId);
                if (user != null)
                  userName = user.fullName;
              }

              model.set("creator", userName);
            });

              catalogItems.all = registered;
              catalogItems.mine = registered.filter(each=>each.get('creatorId')===currentUserId);
              catalogItems.used = catalogItems.mine.filter(each=>each.get('parentCollection')!=="user");

              return {
                images: this.get('store').findAll('image', {reload: true}),
                tales: this.get('store').findAll('tale', {reload: true}),
                dataRegistered: this.get('store').query('folder', {adapterOptions:{registered: true}}, {reload: true}),
                catalogItems: catalogItems
              };
          })
          .catch(e => {
              console.log(e);
          });

  }
});
