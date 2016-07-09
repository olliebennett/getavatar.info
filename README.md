# Gravatar Profile Viewer

Show full profile details (if available) based on any [Gravatar](http://en.gravatar.com/) image on any site.

See it in action at [GetAvatar.info](http://www.getavatar.info/)!

## Idea

When a webpage contains a Gravatar user image, it's possible to extract the hash from this image URI and use it to request the associated profile information.

This would provide extra information about the user creating content (such as comments) on a site, which may otherwise not be shown. No unauthorised information is gained, as the profile data is openly available.

### Example:

An image is embedded in the page: `https://secure.gravatar.com/avatar/a49dac25dce3eea611ce4475cc5e8744?...`

![Ollie's Gravatar](https://secure.gravatar.com/avatar/a49dac25dce3eea611ce4475cc5e8744?s=80)

From this, we can pick out my email's hash:

`a49dac25dce3eea611ce4475cc5e8744`

Note: This hash is just an MD5 of the user's (trimmed + lowercased) email address, as documented [here](https://en.gravatar.com/site/implement/hash/).

When we fire off a [request](https://en.gravatar.com/site/implement/profiles/json/) to Gravatar:

`http://en.gravatar.com/a49dac25dce3eea611ce4475cc5e8744.json`

... we receive this ...

```json
{
  "entry":[
    {
      "id":"508983",
      "hash":"a49dac25dce3eea611ce4475cc5e8744",
      "requestHash":"a49dac25dce3eea611ce4475cc5e8744",
      "profileUrl":"http:\/\/gravatar.com\/olliebennett",
      "preferredUsername":"olliebennett",
      "thumbnailUrl":"http:\/\/0.gravatar.com\/avatar\/a49dac25dce3eea611ce4475cc5e8744",
      "photos":[
        {
          "value":"http:\/\/0.gravatar.com\/avatar\/a49dac25dce3eea611ce4475cc5e8744",
          "type":"thumbnail"
        }
      ],
      "name":{
        "givenName":"Ollie",
        "familyName":"Bennett",
        "formatted":"Ollie Bennett"
      },
      "displayName":"Ollie",
      "currentLocation":"London, UK",
      "urls":[]
    }
  ]
}
```

It could be useful to render this for easy viewing - for example when clicking on the Gravatar image on the page, we could trigger the profile display in a modal.

## Guessing the Email Address

Notice that the original email is not included in the API response JSON above. This is great for privacy, but it's not fool-proof!

We can take an extra step and make educated guesses at the original email address. For example, taking the `preferredUsername` and searching for matching email addresses which give the original hash when MD5'd. For example:
- `olliebennett@hotmail.com` -> `e92837e3bfbc8e4ae6beba5dc6a3fa77` NO MATCH
- `olliebennett@gmail.com` -> `a49dac25dce3eea611ce4475cc5e8744` MATCH!

Trying all common email domains is likely to find a match. If not, trying substrings from the username, or the username as a domain itself could provide some basic alternative emails to search with. This could be as sophisticated as necessary, and the MD5 algorithm is very fast (with [JavaScript implementations](https://github.com/blueimp/JavaScript-MD5) available).

With the email address, we could retrieve additional information and social media accounts, perhaps via a service like [FullContact](https://www.fullcontact.com/).
