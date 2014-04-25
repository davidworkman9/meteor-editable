if (Meteor.isClient) {
    Session.setDefault('text', new Date(2014,04,22));
    Session.setDefault('poss', 'bottom');
    var arr = [];
    _(10).times(function (i) {
        arr.push({
            value: i,
            text: i
        });
    });
    Session.setDefault('options', arr);

    Template.main.helpers({
        options: function () {
            return Session.get('options');
        },
        text: function () {
            return Session.get('text');
        },
        poss: function () {
            return Session.get('poss');
        },
        onsubmission: function () {
            return function (value) {
                Session.set('text', value);
            };
        }
    });
}

