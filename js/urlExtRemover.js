// https://gist.github.com/Sysetup/822f238b97388f91ed57178d5a5b3f8d
var url = window.location.href;
url = url.split('.html')[0];
window.history.replaceState( null, null, url );