mEditable = {
    _types: new Mongo.Collection(null),
    getTemplate: function (type) {
        var t = this._types.findOne({_id: type });
        if (!t)
            throw new Meteor.Error(500, 'Editable type ' + type + ' is not defined.');
        return Template[t.template] || null;
    },
    getVal: function (type) {
        return this._types.findOne({_id: type }).getVal;
    },
    addType: function (type) {
        type._id = type.type;
        delete type.type;

        // allow users to override types
        this._types.remove({_id:  type._id });

        check(type, {
            _id: Match.Where(function (t) {
                check(t, String);
                return t !== '';
            }),
            classes: Match.Optional([String]),
            getVal: Function,
            template: Match.Where(function (t) {
                return typeof t === 'object';
            })
        });
        
        // store only the template name
        if (type.template.viewName) {
            type.template = type.template.viewName.replace(/Template\./, '');
        } else if (!type.template.kind) {
            type.template = type.template.__templateName;
        } else {
            type.template = type.template.kind.replace(/^Template_/, '');
        }
        
        return this._types.insert(type);
    }
};

var m_editable = Template['m_editable_main'];
var POSSIBLE_POSITIONS = ['left', 'right', 'top', 'bottom'];
Template.m_editable.helpers({ 'settings': function () { return generateSettings(this); } });

m_editable.helpers({
    'editableId': function () {
        var tmpl = Template.instance();
        if (!tmpl.view.editableId)
            tmpl.view.editableId = Random.id();
        return tmpl.view.editableId;
    },
    'm_editable_template': function () {
        var template = typeof this.template === 'string' ? Template[this.template] : this.template;
        return this.disabled ? this.disabledTemplate : template;
    },
    'displayVal': function () {
        var v = valueToText(this.value, this.source) || this.emptyText;
        if (typeof this.display === 'function') {
            return this.display(v, this.value) || this.emptyText;
        }

        if (this.disabled)
            return v;
        return v || this.emptyText;
    },
    'value':         function () { return valueToText(this.value, this.source) || this.emptyText; },
    'extraClasses': function () {
        var type = mEditable._types.findOne({ _id: this.type });
        if (type && type.classes) {
            return type.classes.join(' ');
        }
    },
    'editableEmpty': function () {
        var v = valueToText(this.value, this.source);
        if (typeof this.display === 'function') {
            v = this.display(v, this.value);
        }
        return !v.toString().trim() ? 'editable-empty' : '';
    },
    //'loading': function (a,b) {
    //    return Template.instance().Session.get('loading');
    //}
});

Template.m_editable_popover.helpers({
    'resetForm': function () {
        return Session.get('m_editable.resetForm');
    },
    'inputTemplate': function () { return mEditable.getTemplate(this.type); }
});

m_editable.events({
    'resize .editable-container': function (e, tmpl) {
        resizePopover(tmpl.getPopover(), this.position);
    },
    'click .editable-cancel': function (e, tmpl) {
        tmpl.getPopover().trigger('hide');
    },
    'click .editable-click': function (e, tmpl) {
        tmpl.getPopover().trigger(!tmpl.Session.get('popover-visible') ? 'show' : 'hide');
    }
});

function getMainTemplateInstance (tmpl) {
    var id = tmpl.$('.popover').parent().data('id');
    if (!id)
        id = tmpl.$('.popover').parent().find('input.editable-id').val();
    return Blaze.getView($('input.editable-id[value="' + id + '"]')[0]).templateInstance();
}

Template.m_editable_popover.events({
    'submit .editableform': function (e, popoverTmpl) {
        e.preventDefault();
        var tmpl = getMainTemplateInstance(popoverTmpl),
            self = this,
            val = mEditable.getVal(self.type)(popoverTmpl.$('.editable-input'));

        if (typeof self.onsubmit === 'function') {
            if (self.async) {
                tmpl.Session.set('loading', true);
                this.onsubmit.call(this, val, function () {
                    tmpl.getPopover().trigger('hide');
                    doSavedTransition(tmpl);
                });
                return;
            }
            this.onsubmit.call(this, val);
        } else {
            tmpl.$('.editable-click').text(val);
        }
        tmpl.getPopover().trigger('hide');
        doSavedTransition(tmpl);
    },
    'hidden .m_editable-popup': function (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
        tmpl.Session.set('loading', false);

        // hack to reset form
        Session.set('m_editable.resetForm', true);
        setTimeout(function () {
            Session.set('m_editable.resetForm', false);
        }, 10);
    },
    'shown .m_editable-popup': function (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
        tmpl.$('.editable-focus').first().focus();
    },
    'hide .m_editable-popup': function (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
        if (tmpl.Session.equals('popover-visible', false)) {
            e.stopImmediatePropagation();
            return;
        }

        tmpl.Session.set('popover-visible', false);

        setTimeout(function () {
            $(e.target).trigger('hidden');
        }, 325); // 325 seems to be the magic number (for my desktop at least) so the user doesn't see the form show up again
    },
    'show .m_editable-popup': function (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
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
    var $popover = self.$('.m_editable-popup');
    var $bodyEditables = $('#body-editables');
    if ($bodyEditables.length === 0) {
        $('body').append('<div id="body-editables"></div>');
        $bodyEditables = $('#body-editables');
    }

    self.getPopover = function () {
        if (this.data.appendToBody)
            return $('#body-editables').find('[data-id="' + this.view.editableId+ '"]').find('.m_editable-popup');
        return this.$('.m_editable-popup');
    };

    self.Deps.autorun(function () {
        var data = Template.currentData(self.view);
        if (data.appendToBody && $bodyEditables.find('[data-id="' + self.view.editableId + '"]').length === 0) {
            $bodyEditables.append('<div data-id="' + self.view.editableId + '"></div>');
            Blaze.renderWithData(Template.m_editable_popover, data, $('#body-editables').find('[data-id="' + self.view.editableId + '"]')[0]);
            $popover = $('#body-editables').find('[data-id="' + self.view.editableId + '"]').find('.m_editable-popup');
        } else {
            $('#body-editables').find('[data-id="' + self.view.editableId + '"]').remove();
        }
    });

    self.Deps.autorun(function () {
        var loading = self.Session.get('loading');
        if (typeof loading === 'undefined')
            return;

        if (loading) {
            self.$('.editableform').hide();
            self.$('.editableform-loading').show();
        } else {
            self.$('.editableform-loading').hide();
            self.$('.editableform').show();
        }
    });

    self.Deps.autorun(function () {
        var visible = self.Session.get('popover-visible');
        self.Session.get('loading'); // changes the form size, so need to re-calculate location
        var settings = self.Session.get('settings');
        if (typeof visible === 'undefined') {
            return;
        }

        if (visible) {
            $popover.trigger('show');
            $popover.fadeIn();
            resizePopover(self.getPopover(), self.data.position);
        } else {
            $popover.trigger('hide');
            $popover.fadeOut();
        }
    });
};

function resizePopover ($popover, placement) {
    var editableClick = $popover.prevAll('.editable-click:first');
    if (editableClick.length === 0)
        editableClick = $('input.editable-id[value="' + $popover.parent().data('id') + '"]').siblings('.editable-click:first');
    var actualWidth = $popover[0].offsetWidth,
        actualHeight = $popover[0].offsetHeight,
        pos = $.fn.tooltip.Constructor.prototype.getPosition.call({ $element: editableClick });
    var calculatedOffset = $.fn.tooltip.Constructor.prototype.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

    $.fn.tooltip.Constructor.prototype.applyPlacement.call({
        tip: function () { return $popover; },
        replaceArrow: function (delta, dimension, position) { $popover.find('.arrow').css(position, delta ? (50 * (1 - delta / dimension) + '%') : ''); }
    }, calculatedOffset, placement);
}

Meteor.startup(function () {
    $(document).on('click.m_editable-popover-close', function (e) {
        $('.m_editable-popup:visible').each(function () {
            var $popover = $(this);
            if (!$popover.is(e.target) &&
                !$popover.siblings('.m_editable-popup-handle').is(e.target) &&
                $popover.has(e.target).length === 0 &&
                $popover.siblings('.m_editable-popup-handle').has(e.target).length === 0) {
                $popover.trigger('hide');
            }
        });
    });
});

function valueToText(val, source) {
    val = val || '';
    val = _.isArray(val) ? val : [val];
    if (typeof val[0] === 'undefined')
        val[0] = '';
    if (source && source.length) {
        return _.map(val, function (v, i) {
            _.each(source, function (s) {
                if (s.children) {
                    _.each(s.children, function (s) {
                        if (v.toString() === s.value.toString()) {
                            v = s.text;
                        }
                    });
                } else if (v.toString() === s.value.toString()) {
                    v = s.text;
                }
            });
            return v;
        }).join(', ');
    }

    // if we got this far, return the original value
    return val[0].toString() || '';
}

function generateSettings (settings) {
    if (POSSIBLE_POSITIONS.indexOf(settings.position) == -1)
        delete settings.position;
    if (!mEditable._types.findOne({_id: settings.type }))
        delete settings.type;

    if (settings.source)
        settings.source = _.map(settings.source, function (op) { return typeof op === 'object' ? op : { value: op, text: op }; });
    return _.extend({
        appendToBody: false,
        template: Template.m_editable_handle_atag,
        disabledTemplate: Template.m_editable_handle_disabled,
        type: 'text',
        emptyText: 'Empty',
        async: false,
        select2: {},
        combodate: {},
        showbuttons: true,
        onsubmit: null,
        value: null,
        position: 'left',
        title: null,
        placeholder: null
    }, settings);
}

function doSavedTransition (tmpl) {
    var $e = tmpl.$('.editable-click'),
        bgColor = $e.css('background-color');

    $e.css('background-color', '#FFFF80');
    setTimeout(function(){
        if(bgColor === 'transparent') {
            bgColor = '';
        }
        $e.css('background-color', bgColor);
        $e.addClass('editable-bg-transition');
        setTimeout(function(){
            $e.removeClass('editable-bg-transition');
        }, 1700);
    }, 10);
}

// Session & Deps stuff
m_editable.destroyed = function () { this.Session.destroyAll(); this.Deps.stopAll(); };
m_editable.created = function () {
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
