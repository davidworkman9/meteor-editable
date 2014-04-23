if (Meteor.isClient) {
    Session.setDefault('text', 'superuser');
    Session.setDefault('poss', 'bottom');
    Template.main.text = function () {
        return Session.get('text');
    };
    Template.main.poss = function () {
        return Session.get('poss');
    };
    Template.main.onsubmission = function () {
        return function (value) {
            Session.set('text', value);
        }
    };
}

