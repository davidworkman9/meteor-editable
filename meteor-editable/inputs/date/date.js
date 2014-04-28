mEditable.addType({
    type: 'date',
    template: Template.m_editable_form_date,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('div.editable-date').datepicker('getDate');
    }
});

Template.m_editable_form_date.helpers({
    'value': function () {
        var val = this.value;
        var rand = Random.id();
        Meteor.defer(function () {
            var $date = $('input[type="hidden"][value="' + rand + '"]').siblings('div.editable-date');

            // initialize datepicker if it hasn't been already
            if ($date.children().length === 0) {
                initializeDatepicker($date);
            }
            if (val instanceof Date)
                $date.datepicker('setDate', stripTimeFromDate(val));
        });
        return rand;
    }
});

Template.m_editable_form_date.events({
    'show': function (e) {
        e.stopImmediatePropagation();
    },
    'changeDate': function (e) {
        if (e.date && !this.showbuttons && e.date.getTime() !== getCurrentValsTime(this.value)) {
            $(e.target).closest('form').submit();
        }

        function getCurrentValsTime (v) {
            if (!v)
                return false;
            return stripTimeFromDate(v).getTime();
        }
    }
});

Template.m_editable_form_date.rendered = function () {
    var self = this;
    initializeDatepicker(self.$('div.editable-date'))
        // for some reason, the click events aren't being registered as inside the popover and causing
        // the hide event to be called and events don't fire when registered under Template.events
        .click(function (e) { e.stopPropagation(); });
};

function initializeDatepicker(div) {
    return div.datepicker({
        weekStart: 0,
        startView: 0,
        minViewMode: 0,
        autoclose: false
    });
}

function stripTimeFromDate(date) {
    if (date instanceof Date)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}