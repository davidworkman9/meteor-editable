var dep = null;
Template.m_editable_form_date.destroyed = function () { if (deps) deps.stop(); };
Template.m_editable_form_date.helpers({
    'value': function () {
        if (dep)
            dep.stop();

        var val = this.value;
        var rand = Random.id();
        Meteor.defer(function () {
            $('input[type="hidden"][value="' + rand + '"]').siblings('div.editable-date')
        });
        return rand;

    }
});

Template.m_editable_form_date.rendered = function () {
    var self = this;
    self.$('div').datepicker({
        weekStart: 0,
        startView: 0,
        minViewMode: 0,
        autoclose: false
    })
        // for some reason, the click events aren't being registed as inside the popover and causing
        // the hide event to be called and events don't fire when registered under Template.events
        .click(function (e) { e.stopPropagation(); });
};

Template.m_editable_form_date.getVal = function ($container) {
    return $container.find('div').datepicker('getDate');
};