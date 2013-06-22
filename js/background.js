var pollIntervalMin = 1000 * 60;  // 1 minute
var pollIntervalMax = 1000 * 60 * 10; // 10 minutes
var requestFailureCount = 0;  // used for exponential backoff
var requestTimeout = 1000 * 15;
var options = {};
var scheduled = false;
var notifications = [];
var news = 0;
var tid; // timeout id
var logged = false;
var api =  'http://a.wykop.pl/search/index/appkey,h7Rfg78hSg,output,clear';
var urls = {};
var tabs = {};

function scheduleRequest() {
    if(!scheduled){
        scheduled = true;
        var randomness = Math.random() * 2;
        var exponent = Math.pow(2, requestFailureCount);
        var delay = Math.min(randomness * pollIntervalMin * exponent, 
        pollIntervalMax);
        delay = Math.round(delay);
        window.setTimeout(startRequest, delay); 
    }       
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log(request);
    
    clearTimeout(tid);
    
    if(request.news || logged != request.logged){
        startRequest();
    } else {
        scheduleRequest();   
    }
    
    var newstemp = news;
    
    if(request.hasOwnProperty('logged')){
        logged = request.logged;
        updateIcon();           
    }        
    
    //        if(request.hasOwnProperty('notifications')){
    //            notifications = request.notifications;
    //            
    //            if(sender.tab){
    //                // real browser - clear new counter               
    //                news = 0;
    //            }else {
    //                var badge = 0;
    //                for(var i = 0; i < notifications.length; i++){
    //                    if(notifications[i]['new']){
    //                        badge++;
    //                    }
    //                }
    //                news += badge;
    //            }
    //        }
    sendResponse({
        news: news,
        newstemp: newstemp
    });
    updateBadge();
});

function updateBadge(tabId){
    if(news){
        chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0, 0, 255]
        });
        
        chrome.browserAction.setBadgeText({
            text: news.toString()
        });
        
        // force diggs overwrite
        for(var id in tabs){
            if(tabs[id]){
                // keys in object are always strings...
                id = parseInt(id, 10);
                chrome.browserAction.setBadgeBackgroundColor({
                    color: [255, 0, 0, 255],
                    tabId : id
                });
        
                chrome.browserAction.setBadgeText({
                    text: news.toString(),
                    tabId : id
                });
            }
        }
    } else {
        for(var id in tabs){
            if(tabs[id]){
                // keys in object are always strings...
                id = parseInt(id, 10);
               
                chrome.browserAction.setBadgeBackgroundColor({                
                    color :  [87, 153, 195, 255],
                    tabId : id
                });
        
                chrome.browserAction.setBadgeText({
                    text : tabs[id].toString(),
                    tabId : id
                });
            }else {
                
            }
        }
        chrome.browserAction.setBadgeText({
            text: ''
        });
    }
}

function ajax(url, success, error, post){
    if(typeof error === 'undefined'){
        error = function(){
            console.log('ajax error');
        };
    }
    
    var xhr = new XMLHttpRequest();
    var abortTimerId = window.setTimeout(function() {
        console.log('timeout!')
        xhr.abort();  // synchronously calls onreadystatechange
    }, requestTimeout);
    
    try {
        xhr.onreadystatechange = function(){
            if (xhr.readyState != 4){
                return;
            }
            
            window.clearTimeout(abortTimerId);
            if (xhr.status == 200 && xhr.responseText != ""){                    
                success(JSON.parse(xhr.responseText))    
            }else {
                error();
            }
        }
        xhr.open(post ? 'POST' : 'GET', url, true);
        if(post){
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');    
        }
        if (post){
            var parts = [];
            for(var key in post){
                parts.push(key + '=' + encodeURIComponent(post[key]));
            }                
            xhr.send(parts.join('&'));
        } else {
            xhr.send();
        }
    } catch(e){
        window.clearTimeout(abortTimerId);
        error();
    }
}

function checkNotifications(){
    var error = function(){
        logged = false;
        updateIcon();
        scheduleRequest();
    };

    ajax('http://www.wykop.pl/ajax/notifications/count', function(data){
        if(data.error){
            error();
        }else {
            news += data.count;
            if(data.count){
                updateNotifications();
            }
            logged = true;
            updateIcon();
            updateBadge();
        }
    }, error);
};


function updateNotifications(){
    var error = function(){
        logged = false;
        updateIcon();
        scheduleRequest();
    };

    ajax('http://www.wykop.pl/ajax/notifications', function(data){
        if(data.error){
            error();
        } else {
            var html = data.html.replace('<ul class="small">', '</li>').replace('</ul>', '<li>');
            var temp = html.split(/<\/li>\s+<li.*?>/);
            var list = [];
            for(var i = 1; i < temp.length - 1; i++){
                list.push({
                    html: temp[i]
                });
            }
            notifications = list;
            logged = true;
            updateIcon();
        }
    }, error);
}

function updateIcon(){
    if(logged){
        chrome.browserAction.setIcon({
            path: 'img/19.png'
        });
    }else {
        chrome.browserAction.setIcon({
            path: 'img/19bw.png'
        });
    }
}

function startRequest() {
    checkNotifications();
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    var url = tab.url;
    var tid = tabId;
    
    if (changeInfo.url) {
        if (changeInfo.url.match(/^http/) && !changeInfo.url.match(/^.*\.wykop.pl\//) ){
            ajax(api, function(response){
                if (response.length > 0 && url == response[0].source_url ) {
                    urls[url] = response[0];
                    tabs[tid] = urls[url].vote_count;
                } else {
                    urls[url] = null;
                    tabs[tid] = 0;
                }
                updateBadge(tid);
            }, function(){}, {
                url: changeInfo.url
            });
        }
    }
    
    if (urls.hasOwnProperty(url) && urls[url]){
        tabs[tid] = urls[url].vote_count;
        updateBadge(tid);
    }else {
        updateBadge();
    } 
});

window.onload = function(){
    if(localStorage.news){
        news = parseInt(localStorage.news, 10);
        news = isNaN(news) ? 0 : news;
    }
    updateBadge();
    updateIcon();
    checkNotifications();
    updateNotifications();
};

window.onbeforeunload = function(){
    localStorage.news = news;
};