importScripts('md5.js');

onmessage = function(e) {
  console.log('Worker: Message received from main script');
  var hash = e.data[0]
  var mailboxes = e.data[1];
  var domains = e.data[2];

  checkEmailAddresses(hash, mailboxes, domains);
}

var checkEmailAddresses = function(hash, mailboxes, domains) {
  // Try every combination of mailbox@domain
  var domains_count = domains.length;
  for (var d = 0; d < domains_count; d++) {
    var domain = domains[d];
    postMessage(['DOMAIN_BEGIN_PROCESSING', domain]);
    var mailboxes_count = mailboxes.length;
    for (var m = 0; m < mailboxes_count; m++) {
      var mailbox = mailboxes[m];
      var test_email = mailbox + '@' + domain;
      var test_hash = MD5(test_email);
      // if ((m * d) % 1000 === 0) {
      //   console.log("Testing email: " + test_email);
      // }
      if (test_hash == hash) {
        postMessage(['MATCH_FOUND', test_email]);
        postMessage(['TOGGLE_LOADING', false, false]);
        postMessage(['DOMAIN_CHECK_RESULT', domain, 'check1', true]);
        postMessage(['DOMAIN_CHECK_RESULT', domain, 'check2', true]);
        return test_email;
      }
    };
    postMessage(['DOMAIN_CHECK_RESULT', domain, 'check1', false]);
    postMessage(['DOMAIN_CHECK_RESULT', domain, 'check2', false]);
  };

  postMessage(['TOGGLE_LOADING', false, true]);

  return null; // no match :(
}
