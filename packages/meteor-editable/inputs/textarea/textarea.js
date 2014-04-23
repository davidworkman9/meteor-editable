Template.m_editable_form_textarea.events({
    'keydown textarea': function (e) {
        if (e.ctrlKey && e.which === 13) {
            $(e.target).closest('form').submit();
        }
    }
});

Template.m_editable_form_textarea.getVal = function ($container) {
    return $container.find('textarea').val();
};