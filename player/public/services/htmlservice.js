org.ekstep.service.html = new(org.ekstep.service.mainService.extend({
    localData: {},
    _jsFilesToLoad: [],
    _callback: undefined,
    _jsFileIndex: 0,
    init:function(){
        console.info('HTML service init');
    },
    initialize:function(){
        console.info("html service intialize");
    },
    getCurrentUser: function() {
        return new Promise(function(resolve, reject) {
            if (org.ekstep.service.html.localData.user) {
                var result = org.ekstep.service.html.localData.user;
                resolve(result);
            } else {
                reject("User data is not present in localData.")
            }
        });
    },
    getContent: function(id) {
        return new Promise(function(resolve, reject) {
            var result = _.findWhere(org.ekstep.service.html.localData.content, {
                "identifier": id
            });
            resolve(result);
        });
    },
    getLocalData: function(callback) {
        org.ekstep.service.html._callback = callback;
        org.ekstep.service.html._jsFileIndex = 0;
        org.ekstep.service.html._jsFilesToLoad = [];
        org.ekstep.service.html._jsFilesToLoad.push({
            "file": "test/content-list.json"
        });
        org.ekstep.service.html._jsFilesToLoad.push({
            "file": "test/word-list.json",
            "id": "wordList"
        });
        org.ekstep.service.html._jsFilesToLoad.push({
            "file": "test/user.json",
            "id": "user"
        });
        org.ekstep.service.html.loadJsFilesSequentially();
    },
    loadJsFilesSequentially: function() {
        if (org.ekstep.service.html._jsFilesToLoad[org.ekstep.service.html._jsFileIndex]) {
            var fileObj = org.ekstep.service.html._jsFilesToLoad[org.ekstep.service.html._jsFileIndex];
            var fileToLoaded = fileObj.file;
            jQuery.getJSON(fileToLoaded, function(jsonResp) {
                if (fileObj.id) {
                    var respObj = {};
                    respObj[fileObj.id] = jsonResp;
                    _.extend(org.ekstep.service.html.localData, respObj);
                } else {
                    _.extend(org.ekstep.service.html.localData, jsonResp);
                }
                console.log("LocalData json loaded", org.ekstep.service.html.localData);
                org.ekstep.service.html._jsFileIndex = org.ekstep.service.html._jsFileIndex + 1;
                org.ekstep.service.html.loadJsFilesSequentially();
            });
        } else {
            console.log("js files load complete.");
            if (org.ekstep.service.html._callback) {
                console.log("local Files loaded successfully.");
                org.ekstep.service.html._callback();
            } else {
                console.log("local Files loaded successfully. But no callback function");
            }
        }
    },
    languageSearch: function(filter) {
        return new Promise(function(resolve, reject) {
            //var result = _.findWhere(org.ekstep.service.html.localData.languageSearch, {"filter": filter});
            if (org.ekstep.service.html.localData.wordList) {
                resolve(org.ekstep.service.html.localData.wordList);
            } else {
                reject("wordList data is not present in localData.")
            }
        });
    },
    endContent: function() {
        // On close of the content call this function
        var contentId = localStorage.getItem('cotentId');
        if (_.isUndefined(contentId)) {
            console.log("ContentId is not defined in URL.");
            return;
        }
        var endPageStateUrl = '#/content/end/' + contentId;
        this.showPage(endPageStateUrl);
    },
    showPage: function(pageUrl) {
        if ("undefined" != typeof cordova) {
            var url = "file:///android_asset/www/index.html" + pageUrl;
            window.location.href = url;
        } else if (self != top) {
            // if the it is Iframe then fallow the below url syntax
            /*https://dev.ekstep.in/assets/public/preview/dev/preview.html?webview=true#/content/end/do_10097197"*/
            var iframe_url = window.frameElement.src;
            iframe_url = iframe_url.indexOf("&") != -1 ? iframe_url.substring(0, iframe_url.indexOf("&")) : iframe_url;
            window.location = iframe_url + pageUrl;
        } else {
            window.location = "/" + pageUrl;
        }
    }
}));
if (typeof cordova == 'undefined' && typeof isbrowserpreview == 'undefined' && typeof AppConfig == 'undefined') {
    org.ekstep.service.renderer = org.ekstep.service.html;    
}