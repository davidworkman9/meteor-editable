Package.describe({
    summary: "Meteor-Editable - in-place edit package influenced by x-editable",
    version: "0.2.0",
    git: "https://github.com/davidworkman9/meteor-editable.git",
    name: "workman:meteor-editable"
});

Package.on_use(function (api) {
    var fs = Npm.require('fs');
    api.use([
        'check',
        'ecmascript',
        'reactive-dict',
        'mongo',
        'meteor-platform',
        'templating',
        'underscore'
    ], 'client');

    if(api.versionsFrom) {
        api.versionsFrom('METEOR@1.3');
    }

    // libs
    api.addFiles([
        'lib/select2/select2.js',
        'lib/select2/select2.css',

        'lib/bootstrap-datetimepicker/bootstrap-datetimepicker.css',
        'lib/bootstrap-datetimepicker/bootstrap-datetimepicker.js',

        'lib/combodate/combodate.js'
    ], 'client');

    api.addFiles([
        'lib/select2/select2.png',
        'lib/select2/select2x2.png'
    ], 'client', { isAsset: true });

    // main files
    api.addFiles([
        'bootstrap-editable.css',
        'editable.html',
        'editable.js'
    ], 'client');

    // input types
    api.addFiles([
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

        'inputs/radiolist/radiolist.html',
        'inputs/radiolist/radiolist.js',

        'inputs/combodate/combodate.html',
        'inputs/combodate/combodate.js',

        'inputs/textarea/textarea.html',
        'inputs/textarea/textarea.js'
    ], 'client');

    api.export('mEditable');
});
