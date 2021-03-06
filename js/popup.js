function substitute(string, object, regexp){
    return string.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
        if (match.charAt(0) == '\\') return match.slice(1);
        return (object[name] != null) ? object[name] : '';
    });
}

function clickable(){
    // make links clickable
    var a = document.getElementsByTagName('a');
    for(var i = 0; i < a.length; i++){
        a[i].addEventListener('click', function(e){
            chrome.tabs.create({url: this.getAttribute('href')});
        });
    }  
}

window.onload = function(){
    var bg = chrome.extension.getBackgroundPage();
    var list = document.getElementById('notifications');

    if(bg.logged) {
        var notifications = bg.notifications;
   
        for(var i = 0, c = notifications.length > 10 ? 10 : notifications.length; i < c; i++){
            var e = document.createElement("li");
            if(notifications[i]['new'] || i < bg.news){
                e.className = 'new';
            }
            e.className = 'brbotte8';
            e.innerHTML = notifications[i].html;
            list.appendChild(e);
        }
             
        bg.news = 0;
        bg.updateBadge(); 
    } else {
        document.getElementById('content').innerHTML = 'Zaloguj się na <a href="http://wykop.pl">wykop.pl</a>';
    }
    clickable();

    chrome.tabs.getSelected(null, function(tab) {
        if(bg.urls[tab.url]){
            
            var parts = bg.urls[tab.url].source_url.match(/^((http[s]?|ftp):\/\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*?)?(#[\w\-]+)?$/);
            bg.urls[tab.url].source_url_domain = parts[3].replace(/^www\./, '');
            
            var tpl = '<article class="entry brbotte8 pding15_0">' +
                '<div class="clr rel"><div class="fleft diggbox">' +
                '<a href="http://www.wykop.pl/link/dig/%7E2/886753/6d917ad49a5e0b15ecc3f3cbcee87d9f-1316736671/log_ref_0,index,log_ref_m_0,index,log_ref_n_0," class="block tcenter tdnone diggit ">' +
                '<span class="icon inlblk diggcount cff5917 large fbold vtop animated ">{vote_count}</span>' +
                '<span class="block action small br3 bre3">wykop</span></a></div>' +
                '<a href="{url}" class="image rel fright"><img src="{preview}" alt="{title}" class="fright border marginleft15" width="104" height="74"></a>' +
                '<div class="content"><header><h2 class="xx-large lheight20">' +
                '<a href="{url}" class="link"><span class="fbold">{title}</span></a></h2>' +
                '<span>{author}</span></a> z <a href="{source_url}" rel="nofollow" class="link gray" title=""><span>{source_url_domain}</span></a>' +
                '<a href="{url}" class="marginleft10 caf small tdnone">' +
                '<span class="icon inlblk comments mini vtop margintop5 ">&nbsp;</span> ' +
                '<span class="hvline link gray">{comment_count} komentarzy</span></a></p></header>' +
                '<p class="lheight18"><a href="{url}" class="block ce1"><span class="c22">{description}</span></a></p>' +
                '</div></div></article>';
            document.getElementById('entry').innerHTML = substitute(tpl, bg.urls[tab.url]);
            clickable();
        }
    });      
};