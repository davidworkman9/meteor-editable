if (Meteor.isClient) {
    Session.setDefault('simpleText', 'superuser');
    Template.main.helpers({
        'simpleTextOps': function () {
            return {
                type: 'text',
                value: Session.get('simpleText'),
                title: 'Enter username',
                onsubmit: function (val) {
                    Session.set('simpleText', val);
                }
            }
        },
        'emptyTextOps': function () {
            return {
                type: 'text',
                value: Session.get('emptyText'),
                title: 'Enter your first name',
                onsubmit: function (val) {
                    Session.set('emptyText', val);
                }
            }
        },
        'selectOps': function () {
            return {
                type: 'select',
                source: [
                    { text: '', value: 0 },
                    { text: 'Male', value: 'm' },
                    { text: 'Female', value: 'f' }
                ],
                value: Session.get('sex'),
                title: 'Select sex',
                showbuttons: false,
                onsubmit: function (val) {
                    Session.set('sex', val);
                }
            }
        },
        'dateOps': function () {
            return {
                type: 'date',
                value: Session.get('date'),
                title: 'Select birthdate',
                showbuttons: false,
                onsubmit: function (val) {
                    Session.set('date', val);
                }
            }
        },
        'datetimeOps': function () {
            return {
                type: 'datetime',
                value: Session.get('datetime'),
                title: 'Select event time',
                onsubmit: function (val) {
                    Session.set('datetime', val);
                }
            }
        },

        'textareaOps': function () {
            return {
                type: 'textarea',
                value: Session.get('textarea'),
                title: 'Comments',
                onsubmit: function (val) {
                    Session.set('textarea', val);
                }
            }
        }
    });
}

