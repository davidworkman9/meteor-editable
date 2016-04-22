const POSSIBLE_POSITIONS = ['left', 'right', 'top', 'bottom'];
const bodyPopovers = new Mongo.Collection(null);

Template.m_editable_main.onCreated(function() {
    this.Session = new ReactiveDict();
});

Template.m_editable_main.onDestroyed(function () {
    bodyPopovers.remove({ _id: this.view.editableId });
});

mEditable = {
    _types: new Mongo.Collection(null),
    getTemplate (type) {
        var t = this._types.findOne({_id: type });
        if (!t)
            throw new Meteor.Error(500, 'Editable type ' + type + ' is not defined.');
        return Template[t.template] || null;
    },
    getVal (type) {
        return this._types.findOne({_id: type }).getVal;
    },
    addType (type) {
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

Template.m_editable.helpers({ 'settings': function () { return generateSettings(this); } });

Template.m_editable_main.helpers({
    editableId () {
        var tmpl = Template.instance();
        if (!tmpl.view.editableId)
            tmpl.view.editableId = Random.id();
        return tmpl.view.editableId;
    },
    m_editable_template () {
        var template = typeof this.template === 'string' ? Template[this.template] : this.template;
        return this.disabled ? this.disabledTemplate : template;
    },
    displayVal () {
        var v = valueToText(this.value, this.source) || this.emptyText;
        if (typeof this.display === 'function') {
            return this.display(v, this.value) || this.emptyText;
        }

        if (this.disabled)
            return v;
        return v || this.emptyText;
    },
    value () { return valueToText(this.value, this.source) || this.emptyText; },
    extraClasses () {
        var type = mEditable._types.findOne({ _id: this.type });
        if (type && type.classes) {
            return type.classes.join(' ');
        }
    },
    editableEmpty () {
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
    resetForm () {

        return Session.get('m_editable.resetForm');
    },
    inputTemplate () { return mEditable.getTemplate(this.type); }
});

Template.m_editable_main.events({
    'resize .editable-container' (e, tmpl) {
        resizePopover(tmpl.getPopover(), this.position);
    },
    'click .editable-click' (e, tmpl) {
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
    'click .editable-cancel' (e, popoverTmpl) {
        var tmpl = getMainTemplateInstance(popoverTmpl);
        tmpl.getPopover().trigger('hide');
    },
    'submit .editableform' (e, popoverTmpl) {
        e.preventDefault();
        var tmpl = getMainTemplateInstance(popoverTmpl),
            self = this,
            val = mEditable.getVal(self.type)(popoverTmpl.$('.editable-input'));

        if (typeof self.onsubmit === 'function') {
            if (self.async) {
                tmpl.Session.set('loading', true);
                this.onsubmit.call(this, val, () => {
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
    'hidden .m_editable-popup' (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
        tmpl.Session.set('loading', false);

        // hack to reset form
        Session.set('m_editable.resetForm', true);
        setTimeout(() => {
           Session.set('m_editable.resetForm', false);
        }, 10);
    },
    'shown .m_editable-popup' (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
    },
    'hide .m_editable-popup' (e, tmpl) {
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
    'show .m_editable-popup' (e, tmpl) {
        tmpl = getMainTemplateInstance(tmpl);
        if (tmpl.Session.equals('popover-visible', true)) {
            e.stopImmediatePropagation();
            return;
        }
        tmpl.Session.set('popover-visible', true);
        setTimeout(function () {
            $(e.target).trigger('shown');
        }, 0);

        Tracker.flush();
        tmpl.getPopover().find('.editable-focus').first().focus();
    }
});


Template.m_editable_body_popovers.helpers({
    'popovers': function () {
        return bodyPopovers.find();
    }
});

Template.m_editable_main.onRendered(function() {
    var $popover = this.$('.m_editable-popup');
    
    this.getPopover = () => {
        if (this.data.appendToBody)
            return $('#body-editables').find('[data-id="' + this.view.editableId + '"]').find('.m_editable-popup');
        return this.$('.m_editable-popup');
    };

    this.autorun(() => {
        var data = Template.currentData(this.view);
        if (data.appendToBody) {
            bodyPopovers.upsert({ _id: this.view.editableId }, { _id: this.view.editableId, data: data });
        } else {
            bodyPopovers.remove({ _id: this.view.editableId });
        }
    });

    this.autorun(() => {
        var loading = this.Session.get('loading');
        if (typeof loading === 'undefined')
            return;

        if (loading) {
            this.$('.editableform').hide();
            this.$('.editableform-loading').show();
        } else {
            this.$('.editableform-loading').hide();
            this.$('.editableform').show();
        }
    });

    this.autorun(() => {
        var visible = this.Session.get('popover-visible');
        this.Session.get('loading'); // changes the form size, so need to re-calculate location
        $popover = this.getPopover();
        var settings = this.Session.get('settings');
        if (typeof visible === 'undefined') {
            return;
        }

        if (visible) {
            $popover.trigger('show');
            $popover.fadeIn();
            resizePopover($popover, this.data.position);
        } else {
            $popover.trigger('hide');
            $popover.fadeOut();
        }

    });
});

function resizePopover ($popover, placement) {
    let editableClick = $popover.prevAll('.editable-click:first');
    if (editableClick.length === 0)
        editableClick = $('input.editable-id[value="' + $popover.parent().data('id') + '"]').siblings('.editable-click:first');
    
    const actualWidth = $popover[0].offsetWidth,
        actualHeight = $popover[0].offsetHeight,
        pos = $.fn.tooltip.Constructor.prototype.getPosition.call({ $element: editableClick });
    const calculatedOffset = $.fn.tooltip.Constructor.prototype.getCalculatedOffset(placement, pos, actualWidth, actualHeight);

    $.fn.tooltip.Constructor.prototype.applyPlacement.call(
        _.extend($.fn.tooltip.Constructor.prototype, {
            tip: () => $popover,
            replaceArrow: () => {}
        }), calculatedOffset, placement);
}

Meteor.startup(() => {
    $(document).on('click.m_editable-popover-close', (e) => {
        $('.m_editable-popup:visible').each(function () {
            var $click, $popover = $(this), id = $popover.parent().data('id');
            $click = id ? $('input[value="' + id + '"]').siblings('.editable-click') :
                $popover.siblings('.editable-click');

            if ($popover.is(e.target) ||
                $popover.has(e.target).length > 0 ||
                $click.is(e.target) ||
                $click.has(e.target).length > 0)
                return;

            $popover.trigger('hide');
        });
    });
});

function valueToText(val, source) {
    val = val || '';
    val = _.isArray(val) ? val : [val];
    if (typeof val[0] === 'undefined')
        val[0] = '';
    if (source && source.length) {
        return _.map(val, (v, i) => {
            _.each(source, (s) => {
                if (s.children) {
                    _.each(s.children, (s) => {
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
        settings.source = _.map(settings.source, op => (typeof op === 'object' ? op : { value: op, text: op }));

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
    setTimeout(() => {
        if(bgColor === 'transparent') {
            bgColor = '';
        }
        $e.css('background-color', bgColor);
        $e.addClass('editable-bg-transition');
        setTimeout(() =>{
            $e.removeClass('editable-bg-transition');
        }, 1700);
    }, 10);
}