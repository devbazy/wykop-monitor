var notifications = document.querySelectorAll('#content .entry-list-notification li');
var result = [];
for(var i = 0; i < notifications.length; i++){
    result.push({
        'new': notifications[i].className == 'new',
        'html': notifications[i].innerHTML,
    });
}

chrome.extension.sendRequest({
    notifications: result
});