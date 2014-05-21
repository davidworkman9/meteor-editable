Package.describe({
    summary: "Meteor-Editable - in-place edit package influenced by x-editable"
});

Package.on_use(function (api) {
    var fs = Npm.require('fs');
    api.use([
        'check',
        'templating',
        'underscore'
    ], 'client');

    // libs
    api.add_files([
        'lib/select2/select2.js',
        'lib/select2/select2.png',
        'lib/select2/select2.css',

        'lib/bootstrap-datetimepicker/bootstrap-datetimepicker.css',
        'lib/bootstrap-datetimepicker/bootstrap-datetimepicker.js'
    ], 'client');

    // main files
    api.add_files([
        'bootstrap-editable.css',
        'editable.html',
        'editable.js'
    ], 'client');

    // input types
    api.add_files([
        'inputs/text/text.html',
        'inputs/text/text.js',

        'inputs/select/select.html',
        'inputs/select/select.js',

        'inputs/select2/select2.html',
        'inputs/select2/select2.js',

        'inputs/date/date.html',
        'inputs/date/date.js',

        'inputs/datetime/datetime.html',
        'inputs/datetime/datetime.js',

        'inputs/checklist/checklist.html',
        'inputs/checklist/checklist.js',

        'inputs/textarea/textarea.html',
        'inputs/textarea/textarea.js'
    ], 'client');
});