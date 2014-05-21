var types = [
    'text',
    'password',
    'number',
    'email',
    'url',
    'tel',
    'number',
    'range',
    'time'
];

_.each(types, function (t) {
    mEditable.addType({
        type: t,
        template: Template.m_editable_form_text,
        getVal: function ($inputWrapper) {
            if (t === 'number')
                return Number($inputWrapper.find('input').val());
            else
                return $inputWrapper.find('input').val();
        }
    });
});

Template.m_editable_form_text.events({
    'input input[type="range"]': function (e, tmpl) {
        tmpl.$('.output').text(tmpl.$(e.target).val());
    }
});
Template.m_editable_form_text.helpers({
    'hasOutput':        function () { return this.type === 'range'; },
    'formControlClass': function () { return this.type !== 'range' ? 'form-control' : 'input-medium'; }
});

/*
 Template.m_editable_form_text.destroyed = function () { this.Session.destroyAll(); this.Deps.stopAll(); };
 Template.m_editable_form_text.created = function () {
    var self = this;

    self.Deps = {
        _handles: [],
        stopAll: function () { _.each(this._handles, function (d) { d.stop(); }); },
        autorun: function (f) { this._handles.push(Deps.autorun(f)); }
    };

    self._sessId = Random.id();
    self.Session = {
        destroyAll: function () {
            _.each(Object.keys(Session.keys), function (key) {
                var sessCheck = new RegExp('-' + self._sessId + '$');
                if(sessCheck.test(key)) {
                    Session.set([key]);
                    delete Session.keys[key];
                }
            });
        },
        set: function (key, val) { return Session.set(key + '-' + self._sessId, val); },
        get: function (key) { return Session.get(key + '-' + self._sessId); },
        equals: function (key, val) { return Session.equals(key + '-' + self._sessId, val); }
    };
};
*/