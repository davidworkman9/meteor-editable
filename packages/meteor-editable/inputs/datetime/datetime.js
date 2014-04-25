mEditable.addType({
    type: 'datetime',
    template: Template.m_editable_form_datetime,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('div.editable-date').datetimepicker('getDate');
    }
});

Template.m_editable_form_datetime.helpers({
    'value': function () {
        var val = this.value;
        var rand = Random.id();
        if (val instanceof Date) {
            Meteor.defer(function () {
                var $date = $('input[type="hidden"][value="' + rand + '"]').siblings('div.editable-date');

                // initialize datetimepicker if it hasn't been already
                if ($date.children().length === 0) {
                    initializeDatetimepicker($date);
                }

                $date.datetimepicker('setDate', val);
            });
        }

        return rand;
    }
});

Template.m_editable_form_datetime.events({
    'show': function (e) {
        e.stopImmediatePropagation();
    },
    'changeDate': function (e) {
        if (!this.showbuttons && e.date.getTime() !== getCurrentValsTime(this.value)) {
            $(e.target).closest('form').submit();
        }

        function getCurrentValsTime (v) {
            if (!v)
                return false;
            return v.getTime();
        }
    }
});

Template.m_editable_form_datetime.rendered = function () {
    initializeDatetimepicker(this.$('div.editable-date'));
};

function initializeDatetimepicker(div) {
    return div.datetimepicker({
        weekStart: 0,
        startView: 0,
        minViewMode: 0,
        autoclose: false
    });
}
