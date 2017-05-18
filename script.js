var handleGravatarResponse = function(profile) {
  var user = profile.entry[0];
  if (!user || !user.name) {
    alert('User info not found on Gravatar.');
    return;
  }
  document.getElementById('displayName').innerHTML = user.displayName;
  document.getElementById('preferredUsername').innerHTML = user.preferredUsername;
  document.getElementById('userData').innerHTML = JSON.stringify(user);
  guessEmailAddress(user.hash, user.preferredUsername, user.name.givenName, user.name.familyName);
};

var guessEmailAddress = function(hash, username, firstname, lastname) {
  var basicMailboxes = [];
  if (username) {
    username = username.toLowerCase();
    basicMailboxes.push(username);
  }
  if (firstname) {
    firstname = firstname.toLowerCase();
    basicMailboxes.push(firstname);
  }
  if (lastname) {
    lastname = lastname.toLowerCase();
    basicMailboxes.push(lastname);
  }

  // Assume people use their birthdays!
  var numberList = [''].concat(range(1980, 2005));

  var seps = ['', '.', '-', '_'];
  if (firstname && lastname) {
    seps.forEach(function(sep1) {
      basicMailboxes.push(firstname + sep1 + lastname)
      basicMailboxes.push(lastname + sep1 + firstname)
      basicMailboxes.push(firstname.substring(0, 1) + sep1 + lastname)
      basicMailboxes.push(firstname + sep1 + lastname.substring(0, 1))
    });
  }

  var possibleMailboxes = [];
  numberList.forEach(function(num) {
    basicMailboxes.forEach(function(basicMailbox) {
      possibleMailboxes.push(basicMailbox + num);
    });
  });

  // De-duplicate...
  possibleMailboxes = possibleMailboxes.filter(function(item, pos, self) { return self.indexOf(item) == pos; });

  return checkEmailAddresses(hash, possibleMailboxes, primaryDomains);
};

var range = function(min, max) {
  var x = [];
  for (var i=min;i<=max;i++) {
    x.push(i);
  }
  return x;
}

var toggleLoading = function(bool, delay) {
  var spinner = document.getElementById('loading-spinner');
  // Optionally delay stopping loader to ensure it's noticed.
  setTimeout(function() {
    spinner.style.display = (bool ? 'block' : 'none');
  }, delay ? 1000 : 0);
}

var checkEmailAddresses = function(hash, mailboxes, domains) {
  toggleLoading(true, false);
  // Try every combination of mailbox@domain
  var mailboxes_count = mailboxes.length;
  var domains_count = domains.length;
  for (var m = 0; m < mailboxes_count; m++) {
    var mailbox = mailboxes[m];
    for (var d = 0; d < domains_count; d++) {
      var domain = domains[d];
      var test_email = mailbox + '@' + domain;
      var test_hash = MD5(test_email);
      if ((m * d) % 1000 === 0) {
        console.log("Testing email: " + test_email);
      }
      if (test_hash == hash) {
        foundMatch(test_email);
        return test_email;
      }
    };
  };

  return null; // no match :(
}

var foundMatch = function(email) {
  toggleLoading(false, true);
  var no_match = document.getElementById('no-match');
  var match = document.getElementById('match');
  var match_email = document.getElementById('match-email');
  match_email.innerHTML = email;
  no_match.style.display = 'none';
  match.style.display = 'block';
}

var getBasicInfo = function(hash) {
  if (!hash || hash === '') {
    alert('Please enter a hash first!');
    return;
  }
  var script = document.createElement('script');
  script.src = 'https://www.gravatar.com/' + hash + '.json?callback=handleGravatarResponse'
  document.head.appendChild(script);
};

window.addEventListener("load", function load(event){
  window.removeEventListener("load", load, false); //remove listener, no longer needed

  var form = document.getElementById('form');
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      var hash = document.getElementById('hash').value;
      getBasicInfo(hash);
    });
  }

  var load_sample = document.getElementById('sample-md5');
  if (load_sample) {
    var sample_md5 = 'a49dac25dce3eea611ce4475cc5e8744';
    load_sample.addEventListener('click', function(e) {
      e.preventDefault();
      document.getElementById('hash').value = sample_md5;
    });
  }

  toggleLoading(false, false);
}, false);
