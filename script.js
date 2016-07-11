var handleGravatarResponse = function(profile) {
  var user = profile.entry[0];
  document.getElementById('displayName').innerHTML = user.displayName;
  document.getElementById('preferredUsername').innerHTML = user.preferredUsername;
  document.getElementById('userData').innerHTML = JSON.stringify(user);
  guessEmailAddress(user.hash, user.preferredUsername, user.name.givenName, user.name.familyName);
};

var guessEmailAddress = function(hash, username, firstname, lastname) {
  var possibleMailboxes = [username];
  if (firstname) { possibleMailboxes.push(firstname); }
  if (lastname) { possibleMailboxes.push(lastname); }

  var seps = ['', '.', '-', '_'];
  if (firstname && lastname) {
    seps.forEach(function(sep) {
      possibleMailboxes.push(firstname + sep + lastname);
      possibleMailboxes.push(lastname + sep + firstname);
      possibleMailboxes.push(firstname.substring(0, 1) + sep + lastname);
      possibleMailboxes.push(firstname + sep + lastname.substring(0, 1));
    });
  }

  // Convert to lowercase
  possibleMailboxes = possibleMailboxes.map(function(mb) { return mb.toLowerCase(); });

  // De-duplicate...
  possibleMailboxes = possibleMailboxes.filter(function(item, pos, self) { return self.indexOf(item) == pos; });
  checkEmailAddresses(hash, possibleMailboxes, primaryDomains);
};

var checkEmailAddresses = function(hash, mailboxes, domains) {
  // Try every combination of mailbox@domain
  mailboxes.forEach(function(mailbox) {
    domains.forEach(function(domain) {
      var test_email = mailbox + '@' + domain;
      var test_hash = MD5(test_email);
      console.log("Testing email: " + test_email);
      if (test_hash == hash) {
        alert("Found email: " + test_email);
      }
    });
  });
}

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
