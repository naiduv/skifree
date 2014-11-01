chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('popup.html', {
    'bounds': {
      'width': 400,
      'height': 300
    }
  });
});