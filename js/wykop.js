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

if(document.getElementById('notificationsBtn')){
    document.getElementById('notificationsBtn').addEventListener('click', function(){
        var spans = document.querySelector('#notificationsBtn span');
        if(spans[1]){
            document.getElementById('notificationsBtn').removeChild(spans[1]);
        }
    });
}

console.log(data);

chrome.extension.sendRequest(data, function(answer){
    if(answer.news){
        if(document.getElementById('notificationsBtn')){
            var span = document.createElement('span');
            span.className = 'abs count x-small br3';
            span.textContent = answer.news;
            document.getElementById('notificationsBtn').appendChild(span);
        }
    }
});

