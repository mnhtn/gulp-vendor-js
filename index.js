'use strict';

var fs = require('fs'),
    path = require('path');

var _dependencies,
    _dependenciesPath = path.join('node_modules/'),
    _vendorPath = path.join('libs/app/scripts/vendor/'),
    _dependenciesList = {};

var _readPropertyFromFile = function(file, name){
    return JSON.parse(fs.readFileSync(file, 'utf8'))[name];
};

var _getMainFilePath = function(depName){
    var _toDirPath = _dependenciesPath + depName,
    _fromDirPath = _readPropertyFromFile(_toDirPath + '/package.json', 'main').replace(/^(\/|\.\/)/ig,'');
    return _toDirPath + '/' +  _fromDirPath;
};

var _createDependenciesList = function(){
    _dependencies = _readPropertyFromFile('package.json', 'devDependencies');
    var i = 0;
    for(var dependecyName in _dependencies) {
        var _itemObj = Object.create(Object.prototype, {
            order: {value: i},
            name: {value: dependecyName},
            path: {value: _getMainFilePath(dependecyName)}
        });
        _dependenciesList[dependecyName] = _itemObj;
        i++;
    }
    return _dependenciesList;
};


var _clearVendor = function(path){
    var _files = fs.readdirSync(path);
    for(var i = 0; i < _files.length; i++){
        fs.unlinkSync(path + _files[i]);
    }
    fs.rmdir(path);
};

var _createVendor = function(){
    if(!Object.keys(_dependenciesList).length) _createDependenciesList(); //if dependencies list dosn't exist, create new

    if(fs.existsSync(_vendorPath)) _clearVendor(_vendorPath); //remove vendor dir

    fs.mkdirSync(_vendorPath); //create new dir
    for(var item in _dependenciesList) { //copy and create new files
        fs.createReadStream(_dependenciesList[item]['path']).pipe(fs.createWriteStream(_vendorPath + _dependenciesList[item]['name'] + '.js'));
    }
}

//init
var init = function(){
    _createVendor();
};

module.exports = init;