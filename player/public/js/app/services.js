angular.module('quiz.services', ['ngResource'])
    .factory('ContentService', ['$window', '$rootScope', function($window, $rootScope) {
        var setObject = function(key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        };
        var getObject = function(key) {
            var data = $window.localStorage[key];
            if (data)
                return JSON.parse(data);
            else
                return null;
        };
        var processContent = function(content) {
            var localContent = returnObject.getContent(content.identifier);
            if(!localContent) localContent = content;
            localContent.status = "processing";
            localContent.processingStart = (new Date()).getTime();
            if(localContent.filters) {
                if(_.indexOf(localContent.filters, GlobalContext.game.id) == -1) {
                    localContent.filters.push(GlobalContext.game.id);
                }
            } else {
                localContent.filters = [GlobalContext.game.id];
            }
            returnObject.saveContent(localContent);
            return new Promise(function(resolve, reject) {
                DownloaderService.process(content)
                .then(function(data) {
                    for (key in data) {
                        content[key] = data[key];
                    }
                    returnObject.saveContent(content); // move inside ready if condition.
                    if (data.status == 'ready') {
                        for (key in data) {
                            localContent[key] = data[key];
                        }
                        for(key in content) {
                            localContent[key] = content[key];
                        }
                        returnObject.saveContent(localContent);
                        var message = "";
                        if(GlobalContext.config.appInfo && GlobalContext.config.appInfo.code && GlobalContext.config.appInfo.code == packageName) {
                            message = AppMessages.CONTENT_LOAD_MSG.replace("{0}", "1 " + content.type);
                        } else {
                            message = AppMessages.DIRECT_CONTENT_LOAD_MSG;
                        }
                        $rootScope.$broadcast('show-message', {
                            "message": message,
                            "reload": true,
                            "timeout": 3000,
                            "callback": function() {
                                var processing = returnObject.getProcessCount();
                                if(processing > 0) {
                                    $rootScope.$broadcast('show-message', {
                                        "message": AppMessages.DOWNLOADING_MSG.replace('{0}', processing)
                                    });
                                }
                            }
                        });
                    } else if(data.status == 'error') {
                        if(localContent.baseDir) {
                            localContent.status = "ready";
                            localContent.errorCode = data.errorCode;
                        } else {
                            for (key in data) {
                                localContent[key] = data[key];
                            }
                        }
                        returnObject.saveContent(localContent);
                        var message = "";
                        if(data.errorCode == 'DOWNLOAD_ERROR') {
                            message = AppMessages.DOWNLOAD_ERROR.replace("{0}", content.name);
                        } else if(data.errorCode == 'DOWNLOAD_URL_ERROR') {
                            message = AppMessages.DOWNLOAD_URL_ERROR.replace("{0}", content.name);
                        } else if(data.errorCode == 'EXTRACT_FILE_NOT_FOUND') {
                            message = AppMessages.EXTRACT_FILE_NOT_FOUND.replace("{0}", content.name);
                        } else if(data.errorCode == 'EXTRACT_INVALID_OUPUT_DIR') {
                            message = AppMessages.EXTRACT_INVALID_OUPUT_DIR.replace("{0}", content.name);
                        } else if(data.errorCode == 'EXTRACT_INVALID_ARCHIVE') {
                            message = AppMessages.EXTRACT_INVALID_ARCHIVE;
                        } else if(data.errorCode == 'SYSTEM_ERROR') {
                            message = AppMessages.SYSTEM_ERROR.replace("{0}", content.name);
                        }
                        $rootScope.$broadcast('show-message', {
                            "message": message,
                            "timeout": 3000
                        });
                    }
                    resolve(localContent);
                })
                .catch(function(data) {
                    if(localContent.baseDir) {
                        localContent.status = "ready";
                        localContent.errorCode = data.errorCode;
                    } else {
                        for (key in data) {
                            localContent[key] = data[key];
                        }
                    }
                    returnObject.saveContent(localContent);
                    $rootScope.$broadcast('show-message', {
                        "message": "Error while processing content.",
                        "timeout": 3000
                    });
                    resolve(localContent);
                });
            });
        };
        var returnObject = {
            contentKey: "quizapp-content",
            contentList: {},
            init: function() {
                var data = getObject(this.contentKey);
                if (data && data != null) {
                    this.contentList = data;
                } else {
                    this.commit();
                }
            },
            commit: function() {
                setObject(this.contentKey, this.contentList);
            },
            saveContent: function(content) {
                this.contentList[content.identifier] = content;
                this.commit();
            },
            getProcessCount: function() {
                var list = _.where(_.values(this.contentList), {
                    "status": "processing"
                });
                if (_.isArray(list)) {
                    var filteredList =  _.filter(list, function(item) {
                        return _.indexOf(item.filters, GlobalContext.game.id) != -1;
                    });
                    return filteredList.length;
                }
                return 0;
            },
            getProcessList: function() {
                var list = _.where(_.values(this.contentList), {
                    "status": "processing"
                });
                if (_.isArray(list)) {
                    return _.filter(list, function(item) {
                        return _.indexOf(item.filters, GlobalContext.game.id) != -1;
                    });
                }
                return [];
            },
            getContentList: function(type) {
                if (type) {
                    var list = _.where(_.values(this.contentList), {
                        "type": type,
                        "status": "ready"
                    });
                    return _.filter(list, function(item) {
                        return _.indexOf(item.filters, GlobalContext.game.id) != -1;
                    });
                } else {
                    var list = _.where(_.values(this.contentList), {
                        "status": "ready"
                    });
                    return _.filter(list, function(item) {
                        return _.indexOf(item.filters, GlobalContext.game.id) != -1;
                    });
                }
            },
            getContentCount: function(type) {
                var list = returnObject.getContentList(type);
                if (_.isArray(list)) {
                    return list.length;
                } else {
                    return 0;
                }
            },
            getContent: function(id) {
                return returnObject.contentList[id];
            },
            // updateContent: function(content) {
            //     var update = function(obj, resolve, reject) {
            //         setTimeout(function() {
            //             $rootScope.$broadcast('show-message', {
            //                 "message": AppMessages.DIRECT_DOWNLOADING_MSG
            //             });
            //         }, 1000);
            //         processContent(obj)
            //         .then(function(data) {
            //             $rootScope.$broadcast('process-complete', {
            //                 "data": data
            //             });
            //         });
            //         obj.status = "processing";
            //         resolve(obj);
            //     };
            //     return new Promise(function(resolve, reject) {
            //         if(content && content.identifier) {
            //             if (content.status == 'error') {
            //                 update(content, resolve, reject);
            //             } else {
            //                 var localContent = returnObject.contentList[content.identifier];
            //                 if (localContent) {
            //                     for (var key in content) {
            //                         localContent[key] = content[key];   
            //                     }
            //                     returnObject.commit();
            //                     if (localContent.pkgVersion != content.pkgVersion) {
            //                         update(content, resolve, reject);
            //                     } else {
            //                         $rootScope.$broadcast('show-message', {
            //                             "message": AppMessages.NO_NEW_CONTENT,
            //                             "timeout": 3000
            //                         });
            //                         resolve(localContent);
            //                     }
            //                 } else {
            //                     update(content, resolve, reject);
            //                 }
            //             }
            //         } else {
            //             reject('Invalid content to update');
            //         }
            //     });
            // },
            updateContent: function(content) {
                var updateContentPath = function(localContent, resolve, reject) {
                    GenieService.getContent(localContent.identifier)
                    .then(function(result) {
                        (result.path.charAt(result.path.length-1) == '/')? result.path = result.path.substring(0, result.path.length-1): result.path = result.path;
                        localContent.baseDir = "file://" + result.path;
                        localContent.appIcon = "file://" + result.path +'/logo.png';
                        localContent.status = "ready";
                        returnObject.saveContent(localContent);
                        resolve(localContent);
                    })
                    .catch(function(err) {
                        console.error("Error while fetching content path:", err);
                        localContent.status = "error";
                        returnObject.saveContent(localContent);
                        showMessage(AppMessages.ERR_FETCHING_CONTENT_PATH);
                        console.log("Error while fetching content path:" + JSON.stringify(err));
                        resolve(localContent);
                    });
                };
                var showMessage = function(message) {
                    setTimeout(function() {
                        $rootScope.$broadcast('show-message', {
                            "message": message,
                            "timeout": 3000
                        });
                    }, 1000);
                }
                return new Promise(function(resolve, reject) {
                    if(content && content.identifier) {
                        var localContent = returnObject.contentList[content.identifier];
                            if (localContent) {
                                if(localContent.status == "error") {
                                    updateContentPath(localContent, resolve, reject);
                                } else {
                                    for (var key in content) {
                                        localContent[key] = content[key];   
                                    }
                                    returnObject.saveContent(localContent);
                                    resolve(localContent);
                                }
                            } else {
                                localContent = content;
                                updateContentPath(localContent, resolve, reject);
                            }
                    } else {
                        reject('Invalid content to update');
                    }
                });  
            },
            processContent: function(content) {
                var promise = {};
                var localContent = returnObject.getContent(content.identifier);
                if (localContent) {
                    if (localContent.status == 'processing') {
                        var processStart = localContent.processingStart;
                        if (processStart) {
                            var timeLapse = (new Date()).getTime() - processStart;
                            if (timeLapse/60000 > AppConfig.PROCESSING_TIMEOUT) {
                                localContent.status = "error";
                            }
                        }
                    }
                    if ((localContent.status == "ready" && localContent.pkgVersion != content.pkgVersion) || (localContent.status != "ready")) {
                        promise = processContent(content);
                    } else {
                        if(localContent.filters) {
                            if(_.indexOf(localContent.filters, GlobalContext.game.id) == -1) {
                                localContent.filters.push(GlobalContext.game.id);
                                returnObject.saveContent(localContent);
                            }
                        } else {
                            localContent.filters = [GlobalContext.game.id];
                            returnObject.saveContent(localContent);
                        }
                        if (localContent.status == "ready")
                            console.log("content: " + localContent.identifier + " is at status: " + localContent.status + " and there is no change in pkgVersion.");
                        else
                            console.log("content: " + localContent.identifier + " is at status: " + localContent.status);
                    }
                } else {
                    promise = processContent(content);
                }
                return promise;
            },
            sync: function() {
                returnObject.setSyncStart();
                return new Promise(function(resolve, reject) {
                    var filter = {"types": ["Story", "Worksheet"], "filter": {}};
                    if (GlobalContext.filter) {
                        // filter.filter = {"tags" : ["Delhi Curriculum"]};
                        filter.filter = JSON.parse(GlobalContext.filter);
                    }
                    PlatformService.getContentList(filter)
                    .then(function(contents) {
                        var promises = [];
                        if (contents.status == 'error') {
                            var errorCode = contents.errorCode;
                            var errorParam = contents.errorParam;
                            var errMsg = AppMessages[errorCode];
                            if (errorParam && errorParam != '') {
                                errMsg = errMsg.replace('{0}', errorParam);
                            }
                            returnObject.resetSyncStart();
                            $rootScope.$broadcast('show-message', {
                                "message": errMsg
                            });
                        } else {
                            if (contents.appStatus) AppConfig.APP_STATUS = contents.appStatus;
                            if(contents.data) {
                                for (key in contents.data) {
                                    var content = contents.data[key];
                                    promises.push(returnObject.processContent(content));
                                }
                                var localContentIds = _.keys(returnObject.contentList);
                                var remoteContentIds = _.pluck(contents.data, 'identifier');
                                var removingContentIds = _.difference(localContentIds, remoteContentIds);
                                if(removingContentIds.length > 0) {
                                    _.each(removingContentIds, function(id) {
                                        delete returnObject.contentList[id];
                                        console.log('Deleted content from bookshelf: ', id);
                                    });
                                }
                            }
                            Promise.all(promises)
                            .then(function(result) {
                                returnObject.resetSyncStart();
                            });    
                        }
                        resolve(true);
                    })
                    .catch(function(err) {
                        returnObject.resetSyncStart();
                        console.log("Error while fetching content list: ", err);
                        reject("Error while fetching content list: " + err);
                    });
                });
            },
            setContentVersion: function(ver) {
                $window.localStorage["quizapp-contentversion"] = ver;
            },
            getContentVersion: function() {
                return $window.localStorage["quizapp-contentversion"];
            },
            setSyncStart: function() {
                $window.localStorage["quizapp-syncstart"] = (new Date()).getTime();
            },
            getSyncStart: function() {
                return $window.localStorage["quizapp-syncstart"];
            },
            resetSyncStart: function() {
                $window.localStorage["quizapp-syncstart"] = undefined;
            },
            remove: function(key) {
                $window.localStorage.removeItem(key);
            },
            clear: function() {
                $window.localStorage.clear();
            },
            deleteAllContent: function() {
                _.map(returnObject.contentList, function(value, key){
                    DownloaderService.deleteContentDir(key);
                    delete returnObject.contentList[key];
                    returnObject.commit();
                });
            }
        };
        return returnObject;
    }]);

