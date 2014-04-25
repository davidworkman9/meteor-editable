var types = [
    'text',
    'password',
    'number',
    'email',
    'url',
    'tel',
    'number',
    'range',
    'time'
];

_.each(types, function (t) {
    mEditable.addType({
        type: t,
        template: Template.m_editable_form_text,
        getVal: function ($inputWrapper) {
            return $inputWrapper.find('input').val();
        }
    });
});
