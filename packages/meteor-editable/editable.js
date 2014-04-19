var m_editable = Template['m_editable'],
    text_popover = Template['m_editable_text'];

m_editable.helpers({
    'popover_edit': function () {
        return text_popover;
    }
});

m_editable.events({
    'click span': function (e, tmpl) {
        var currentSetting = tmpl.Session.get('popover-visible');
        tmpl.Session.set('popover-visible', !currentSetting);
    }
});

m_editable.rendered = function () {
    var self = this;
    self.Deps.autorun(function () {
        if (self.Session.get('popover-visible')) {
            self.$('.popover').fadeIn();
        } else {
            self.$('.popover').fadeOut();
        }
    });
};


// Session & Deps stuff
m_editable.destroyed = function () { this.Session.destroyAll(); this.Deps.stopAll(); };
m_editable.created = function () {
    var self = this;

    self.Deps = {
        _handles: [],
        stopAll: function () { _.each(this._handles, function (d) { d.stop(); }); },
        autorun: function (f) { this._handles.push(Deps.autorun(f)); }
    };

    self.sessId = Random.id();
    self.Session = {
        destroyAll: function () {
            _.each(Object.keys(Session.keys), function (key) {
                var sessCheck = new RegExp('-' + self.sessId + '$');
                if(sessCheck.test(key)) {
                    Session.set([key]);
                    delete Session.keys[key];
                }
            });
        },
        set: function (key, val) { return Session.set(key + '-' + self.sessId, val); },
        get: function (key) { return Session.get(key + '-' + self.sessId); },
        equals: function (key, val) { return Session.equals(key + '-' + self.sessId, val); }
    };
};