var selectors = [];

for (var i in blackList) {
  var selector = "*://" + blackList[i] +"/*";
  selectors.push(selector);
}

(function(urls) {

    var tabsManager = {
        imagePaths: {
            active: {
                19: 'images/icon19.png', 
                38: 'images/icon38.png'
            }, 
            inactive: {
                19: 'images/icon19_inactive.png', 
                38: 'images/icon38_inactive.png'
            }
        }, 
        setTabCount: function(wId, tId, count) {
            this[wId] = this[wId] ? this[wId] : {};
            this[wId][tId] = count || '';
        }, 
        getTabCount: function(wId, tId) {
            if(!this[wId]) return '';
            return this[wId][tId] || '';
        }, 
        clearTab: function(wId, tId) {
            if(!this[wId]) return;
            delete this[wId][tId];
        }, 
        setBadge(wId, tId, count) {
            var count = count || this.getTabCount(wId, tId);
            this.setTabCount(wId, tId, count);
            browser.browserAction.setBadgeText({ text: count });
        }
    };

    browser.runtime.onMessage.addListener(function(msg, sender, callback) {
        var tId = sender.tab.id;
        var wId = sender.tab.windowId;
        browser.browserAction.setIcon({ path: tabsManager.imagePaths[msg.event], tabId: tId });
        if(msg.event === 'inactive') {
            if(msg.url) console.log('Avoided execution in: ' + msg.url);
           browser.browserAction.setBadgeText({ text: '' });
        } else if(msg.event === 'active') {
            tabsManager.setBadge(wId, tId, msg.count.toString());
        } else if(msg.event === 'get_tId_and_wId') {
            callback({ tId: tId, wId: tId });
        }
    });

    browser.tabs.onActivated.addListener(function(activeInfo) {
        var tId = activeInfo.tabId;
        var wId = activeInfo.windowId;
        tabsManager.setBadge(wId, tId);
    });

    browser.tabs.onRemoved.addListener(function(removedInfo) {
        var tId = removedInfo.id;
        var wId = removedInfo.windowId;
        tabsManager.clearTab(wId, tId);
    });
		
	browser.webRequest.onBeforeRequest.addListener(
		function(details) {
			browser.tabs.update(details.tabId, {url: 'https://cskawebguardian.github.io/' });	  
		},
		{urls: urls},
		["blocking"]
	);
})(selectors);

