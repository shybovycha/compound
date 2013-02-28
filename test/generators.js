require('./spec_helper').init(exports);

var fs = require('fs'),
    path = require('path');

var memfs = {},
    mkdirSync = fs.mkdirSync,
    chmodSync = fs.chmodSync,
    app_name = 'my_app';

fs.mkdirSync = function (name) {
    memfs[name] = true;
};

fs.chmodSync = function () {};

var writeFileSync = fs.writeFileSync,
    readFileSync = fs.readFileSync,
    closeSync = fs.closeSync,
    writeSync = fs.writeSync,
    existsSync = fs.existsSync;

fs.writeFileSync = function (name, content) {
    memfs[name] = content;
    return name;
};

path.existsSync = function (path) {
    return !!memfs[path];
};

compound.utils.appendToFile = function() { };

var exit = process.exit;

it('should generate app', function (test) {
    updArgs([app_name, '--stylus']);
    process.exit = test.done;
    compound.generators.perform('init', args);
    process.chdir(app_name);
    test.done();
});

it('should generate model', function (test) {
    fs.readFileSync = function (name) {
        return memfs[name] || readFileSync(name);
    };

    updArgs([ 'post', 'title', 'content' ]);
    compound.generators.perform('model', args);
    fs.readFileSync = readFileSync;
    test.done();
});

it('should generate controller', function (test) {
    updArgs('cars index show new create edit update'.split(' '));
    compound.generators.perform('controller', args);
    test.done();
});

it('should generate scaffold', function (test) {
    fs.readFileSync = function (name) {
        return memfs[name] || readFileSync(name);
    };

    updArgs([ 'book', 'author', 'title' ]);
    compound.generators.perform('crud', args);
    fs.readFileSync = readFileSync;
    test.done();
});

it('should generate clienside', function (test) {
    fs.existsSync = function () { return true };
    fs.readFileSync = function () { return 'contents'; };
    compound.structure.views = {'file': 'path.js'};
    compound.structure.helpers = {'file': {}};
    updArgs([]);
    compound.generators.perform('cs', args);
    fs.existsSync = existsSync;
    fs.readFileSync = readFileSync;
    test.done();
});

it('relax', function (test) {
    fs.writeFileSync = writeFileSync;
    fs.mkdirSync = mkdirSync;
    fs.chmodSync = chmodSync;
    fs.existsSync = existsSync;
    process.exit = exit;
    test.done();
});

function updArgs(a) {
    while (global.args.pop());

    var k;
    while (k = a.shift()) {
        global.args.push(k);
    }
}

