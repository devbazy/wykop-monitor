var data = {
    news: 0
};

if(document.getElementById('header-container')){
    if(document.getElementById('quick-login') !== null){
        data.logged = false;
    }else if(document.querySelector('.user-panel') !== null){
        data.logged = true;
    }
}

if(document.querySelector('#content .entry-list-notification') !== null){
    var notifications = document.querySelectorAll('#content .entry-list-notification li');
    var result = [];
    for(var i = 0; i < notifications.length; i++){
        result.push({
            'new': notifications[i].className == 'new',
            'html': notifications[i].innerHTML,
        });
    }
    data.notifications = result;
}


var news = document.querySelectorAll('#sub-list li.right');
if(news.length == 2){
    var match = news[1].textContent.match(/Masz nowe powiadomienia \((\d+)\)/);
    data.news = match[0];
}

chrome.extension.sendRequest(data);