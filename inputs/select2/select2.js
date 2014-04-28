mEditable.addType({
    type: 'select2',
    template: Template.m_editable_form_select2,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('div').select2('val');
    }
});

Template.m_editable_form_select2.rendered = function () {
    var self = this,
        data = self.data;

    data.select2 = data.select2 || {};

    if (data.placeholder) {
        data.select2.placeholder = data.placeholder;
    }

    //if not `tags` mode, use source
    if(!data.select2.tags && data.source) {
        data.select2.data = convertSource(data.source);
    }

    data.select2 = _.extend(/* TODO: project defaults */ {}, data.select2);
    self.$('div').select2(data.select2);
};

function convertSource (src) {
    return _.map(src, function (s) {
        if (typeof s.id !== 'undefined') {
            return s;
        }

        return {
            id: s.value,
            text: s.text
        };
    });
}


