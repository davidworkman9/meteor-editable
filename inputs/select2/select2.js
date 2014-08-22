mEditable.addType({
    type: 'select2',
    template: Template.m_editable_form_select2,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('div').select2('val');
    }
});

Template.m_editable_form_select2.events({
    'on-update .select2-editable': function () {},    // just used to make the template data reactive in rendered
    'change .select2-editable': function (e) {
        $(e.target).parents('.editable-container').trigger('resize');
    }
});

Template.m_editable_form_select2.destroyed = function () { if (this.dep) this.dep.stop(); };
Template.m_editable_form_select2.rendered = function () {
    var self = this;
    if (self.dep) self.dep.stop();
    self.dep = Deps.autorun(function () {
        var $select2 = self.$('.select2-editable');
        $select2.trigger('on-update');

        var data = self.data,
            isMultiple = data.select2.tags || data.select2.multiple;
        data.select2 = data.select2 || {};

        if (data.placeholder) {
            data.select2.placeholder = data.placeholder;
        }

        //if not `tags` mode, use source
        if(!data.select2.tags && data.source) {
            data.select2.data = convertSource(data.source);
        }

        data.select2 = _.extend(/* TODO: project defaults */ {}, data.select2);
        try {
            $select2.select2('destroy');
        } catch (e) {}
        $select2.select2(data.select2);

        var value = data.value;
        if (isMultiple && !_.isArray(data.value))
            value = [value];
        $select2.select2('val', value);
    });
};

function convertSource (src) {
    return _.map(src, function (s) {
        if (typeof s.id !== 'undefined') {
            return s;
        }

        if (s.children) {
            return {
                text: s.text,
                children: _.map(s.children, function (s) {
                    return {
                        id: s.value,
                        text: s.text
                    };
                })
            };
        } else {
            return {
                id: s.value,
                text: s.text
            };
        }

    });
}


