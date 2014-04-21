var m_editable = Template['m_editable'],
    text_popover = Template['m_editable_text'];

m_editable.helpers({
    'popover_edit': function () {
        return text_popover;
    }
});

m_editable.events({
    'click .popover-handle': function (e, tmpl) {
        e.stopPropagation();
        tmpl.Session.set( 'popover-visible', !tmpl.Session.get('popover-visible') );
    },
    'hide .popover': function (e, tmpl) { tmpl.Session.set('popover-visible', false); },
    'show .popover': function (e, tmpl) { tmpl.Session.set('popover-visible', true); }
});

m_editable.rendered = function () {
    var self = this;
    var $popover = self.$('.popover');
    self.Deps.autorun(function () {
        if (self.Session.get('popover-visible')) {
            $popover.trigger('show');
            $popover.fadeIn();
            $popover.trigger('shown');


            var placement = self.data.position,
                actualWidth = $popover[0].offsetWidth,
                actualHeight = $popover[0].offsetHeight,
                pos = $.fn.tooltip.Constructor.prototype.getPosition.call({ $element: $popover.siblings('.popover-handle') });
            var calculatedOffset = $.fn.tooltip.Constructor.prototype.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

            $.fn.tooltip.Constructor.prototype.applyPlacement.call({
                tip: function () {
                    return $popover;
                },
                replaceArrow: function (delta, dimension, position) {
                    $popover.find('.arrow').css(position, delta ? (50 * (1 - delta / dimension) + '%') : '')
                }
            }, calculatedOffset, placement);

        } else {
            $popover.trigger('hide');
            $popover.fadeOut();
            $popover.trigger('hidden');
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