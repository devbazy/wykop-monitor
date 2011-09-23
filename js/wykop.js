var data = {
    news: 0
};

if(document.getElementById('header-container')){
    data.logged = /avatar/.test(document.querySelector('#header-container div.quickpoint').className);
}

//if(document.querySelector('#content .entry-list-notification') !== null){
//    var notifications = document.querySelectorAll('#content .entry-list-notification li');
//    var result = [];
//    for(var i = 0; i < notifications.length; i++){
//        result.push({
//            'new': notifications[i].className == 'new',
//            'html': notifications[i].innerHTML,
//        });
//    }
//    data.notifications = result;
//}


chrome.extension.sendRequest(data, function(answer){
    if(answer.news){
        var list = document.getElementById('sub-list').getElementsByTagName('ul')[0]; // #sublist ul
        if(list){
            var li = document.createElement('li');    
            li.className = 'right';
            li.innerHTML = '<div><a href="http://www.wykop.pl/moj/powiadomienia/" title="Zobacz nowe powiadomienia">Masz nowe powiadomienia (' +  answer.news + ')</a></div>';
            list.insertBefore(li, list.childNodes[0]);
    
            li = document.createElement('li');
            li.className = 'right check';
            li.innerHTML = '<div><a href="http://www.wykop.pl/moj/powiadomienia/" title="Zobacz nowe powiadomienia">Sprawdź</a></div>';
            list.insertBefore(li, list.childNodes[0]);
        }
    }
    
    if(answer.newstemp){
        if(document.querySelector('#content .entry-list-notification') !== null){
            var notifications = document.querySelectorAll('#content .entry-list-notification li');
            for(var i = 0; i < answer.newstemp; i++){
                notifications[i].className = 'new';
            }
        }
    }
});

