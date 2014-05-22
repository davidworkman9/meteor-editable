mEditable.addType({
    type: 'combodate',
    template: Template.m_editable_form_combodate,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('.combodate-editable').combodate('getValue');
    }
});

Template.m_editable_form_combodate.events({
    'on-update .combodate-editable': function () {}    // just used to make the template data reactive in rendered
});

Template.m_editable_form_combodate.destroyed = function () { if (this.dep) this.dep.stop(); };
Template.m_editable_form_combodate.rendered = function () {
    var self = this;
    if (self.dep) self.dep.stop();
    self.dep = Deps.autorun(function () {
        var $combodate = self.$('.combodate-editable');
        $combodate.trigger('on-update');

        var data = self.data;
        data.combodate = data.combodate || {};

        data.combodate = _.extend(/* TODO: project defaults */ {}, data.combodate);
        $combodate.combodate(data.combodate);
        $combodate.combodate('setValue', data.value);
    });
};