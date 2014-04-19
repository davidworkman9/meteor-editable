Package.describe({
    summary: "Meteor-Editable - in-place edit package influenced by x-editable"
});

Package.on_use(function (api) {
    api.use(['templating'], 'client');

    api.add_files(['editable.html', 'editable.js'], 'client');
});