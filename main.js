if (Meteor.isClient) {
    Session.setDefault('text', 'superuser');
    Template.main.text = function () {
        return Session.get('text');
    };
    Template.main.onsubmission = function () {
        return function (value, cb) {
            // simulate server latency
            setTimeout(function () {
                Session.set('text', value);
                cb();
            }, 1250);
        }
    };
}

