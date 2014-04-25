mEditable.addType({
    type: 'text',
    template: Template.m_editable_form_text,
    getVal: function ($inputWrapper) {
        return $inputWrapper.find('input').val();
    }
});
