var handleGravatarResponse = function(profile) {
  var user = profile.entry[0];
  document.getElementById('displayName').innerHTML = user.displayName;
  document.getElementById('preferredUsername').innerHTML = user.preferredUsername;
  document.getElementById('userData').innerHTML = JSON.stringify(user);
  guessEmailAddress(user.hash, user.preferredUsername);
};

var guessEmailAddress = function(hash, username) {
  var domains = ['gmail.com', 'googlemail.com', 'hotmail.com'];
  domains.forEach(function(domain) {
    var test_email = username + '@' + domain;
    var test_hash = MD5(test_email);
    if (test_hash == hash) {
      alert("Found email: " + test_email);
    }
  });
};

var getBasicInfo = function(hash) {
  var script = document.createElement('script');
  script.src = 'https://www.gravatar.com/' + hash + '.json?callback=handleGravatarResponse'
  document.head.appendChild(script);
};

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed

  var form = document.getElementById('form');
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    var hash = document.getElementById('hash').value;
    getBasicInfo(hash);
  });
}, false);
