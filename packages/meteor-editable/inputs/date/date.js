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
        if (!this.showbuttons && e.date.getTime() !== stripTimeFromDate(this.value).getTime()) {
            $(e.target).closest('form').submit();
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

Template.m_editable_form_date.getVal = function ($container) {
    return $container.find('div.editable-date').datepicker('getDate');
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
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}