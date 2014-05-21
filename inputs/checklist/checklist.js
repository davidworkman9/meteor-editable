mEditable.addType({
    type: 'checklist',
    template: Template.m_editable_form_checklist,
    getVal: function ($inputWrapper) {
        return _.map($inputWrapper.find('input[type="checkbox"]:checked'), function (el) {
            return el.value;
        });
    }
});

Template.m_editable_form_checklist.helpers({
    'valueChecked': function (v) {
        v = _.isArray(v) ? v : [v];
        return v.indexOf(this.value) !== -1;
    }
});
