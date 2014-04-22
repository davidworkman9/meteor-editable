var m_editable = Template['m_editable'],
    text_popover = Template['m_editable_text'];

m_editable.helpers({
    'popover_edit': function () {
        return text_popover;
    }
});

text_popover.helpers({
    'loading': function (a,b) {
        // can't get tmpl in this context..
//        return tmpl.Session.get('loading');
    }
});

m_editable.events({
    'click .editable-submit': function (e, tmpl) {
        tmpl.Session.set('loading', true);
        if (typeof this.onsubmit === 'function') {
            this.onsubmit.call(this, tmpl.$('form').serializeArray(), function () {
                tmpl.$('.popover').trigger('hide');
            });
        } else {
            tmpl.$('.popover').trigger('hide');
        }
    },
    'click .editable-cancel': function (e, tmpl) {
        tmpl.$('.popover').trigger('hide');
    },
    'submit .editableform': function (e) {
        e.preventDefault();
    },
    'click .popover-handle': function (e, tmpl) {
        e.stopPropagation();
        tmpl.$('.popover').trigger(!tmpl.Session.get('popover-visible') ? 'show' : 'hide');
    },
    'hidden .popover': function (e, tmpl) {
        tmpl.Session.set('loading', false);
    },
    'hide .popover': function (e, tmpl) {
        if (tmpl.Session.equals('popover-visible', false)) {
            e.stopImmediatePropagation();
            return;
        }

        tmpl.Session.set('popover-visible', false);
        setTimeout(function () {
            $(e.target).trigger('hidden');
        }, 0);
    },
    'show .popover': function (e, tmpl) {
        if (tmpl.Session.equals('popover-visible', true)) {
            e.stopImmediatePropagation();
            return;
        }
        tmpl.Session.set('popover-visible', true);
        setTimeout(function () {
            $(e.target).trigger('shown');
        }, 0);
    }
});

m_editable.rendered = function () {
    var self = this;
    var $popover = self.$('.popover');
    self.Deps.autorun(function () {
        if (typeof self.Session.get('popover-visible') === 'undefined') {
            return;
        }

        if (self.Session.get('popover-visible')) {
            $popover.trigger('show');
            $popover.fadeIn();

            var placement = self.data.position,
                actualWidth = $popover[0].offsetWidth,
                actualHeight = $popover[0].offsetHeight,
                pos = $.fn.tooltip.Constructor.prototype.getPosition.call({ $element: $popover.siblings('.popover-handle') });
            var calculatedOffset = $.fn.tooltip.Constructor.prototype.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            $.fn.tooltip.Constructor.prototype.applyPlacement.call({
                tip: function () { return $popover; },
                replaceArrow: function (delta, dimension, position) { $popover.find('.arrow').css(position, delta ? (50 * (1 - delta / dimension) + '%') : ''); }
            }, calculatedOffset, placement);
        } else {
            $popover.trigger('hide');
            $popover.fadeOut();
        }
    });
};

Meteor.startup(function () {
    $(document).on('click.m_editable-popover-close', function (e) {
        $('.popover:visible').each(function () {
            var $popover = $(this);
            if (!$popover.is(e.target) &&
                !$popover.siblings('.popover-handle').is(e.target) &&
                $popover.has(e.target).length === 0 &&
                $popover.siblings('.popover-handle').has(e.target).length === 0) {
                $popover.trigger('hide');
            }
        });
    });
});

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