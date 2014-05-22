mEditable.addType({
    type: 'radiolist',
    template: Template.m_editable_form_radiolist,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('input[type="radio"]:checked').val();
    }
});

Template.m_editable_form_radiolist.helpers({
    'generateName': function () {
        return _.extend(this, { _radioListName: 'editable-radiolist-' + Random.id() });
    },
    'valueChecked': function (v) {
        return v === this.value;
    }
});

