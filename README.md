# warp

Signed URL redirection service.

## Why?

[Firebase Dynamic Links](https://firebase.google.com/docs/dynamic-links) is a useful service that allows me to generate [sharable social links](https://firebase.google.com/docs/dynamic-links/link-previews#social_sharing_previews).
The generated links can be shared to social networks with specified `title`, `description` and `image`.

```js
function getDynamicLink(pageUrl, imageUrl, title, description) {
  const dynamicLink = 'https://dtinth.page.link/?' + [
    `link=${encodeURIComponent(pageUrl)}`,
    `st=${encodeURIComponent(title)}`,
    `sd=${encodeURIComponent(description)}`,
    `si=${encodeURIComponent(imageUrl)}`,
  ].join('&')
  return dynamicLink
}
```

However, for security, [it is a best practice to restrict the usage of Dynamic Page Link to only domains that I own](https://support.google.com/firebase/answer/9021429).
This poses a problem when I want to link to 3rd party domains; I would have to edit the allowlist pattern for each new domain that I link to.

Instead of doing that I decided to create a signed URL redirection service. A redirect is authorized if it is properly cryptographically signed.

## Generating signed URLs

1. Get the URL to sign.

    ```
    https://github.com/dtinth
    ```

2. Use [TweetNaCl](https://tweetnacl.js.org/#/sign) to sign the URL with my own private key. This generates a signature. Encode the signature as [base64url](https://en.wikipedia.org/wiki/Base64#RFC_4648).

    ```
    k-4eL27uaLEgfSvL_KW9NeE2LxW_4gocHxerjOSBno7aR7MHUgGhj5CmHLW2LBgt6rxR_0zrZskZm66RwDtUCA
    ```

3. Construct a signed URL which lives on my personal domain `spacet.me`.

    ```
    https://warp.spacet.me/api/go
        ?u=https://github.com/dtinth
        &i=automatron
        &s=k-4eL27uaLEgfSvL_KW9NeE2LxW_4gocHxerjOSBno7aR7MHUgGhj5CmHLW2LBgt6rxR_0zrZskZm66RwDtUCA
    ```

4. Use that signed URL to generare a Firebase Dynamic Link.

## Parameters

| Query Parameter | Description |
| --------------- | ----------- |
| `u` | URL to redirect to |
| `i` | Issuer of the signed URL, which is registered [in the API's source code](https://github.com/dtinth/warp/blob/fed1374a536b096ef28daa6deb393fa755289eb8/api/go.ts#L5) |
| `s` | The signature, base64url-encoded |
| `p` | Prefix length for delegation (see below) |

## Delegation

In the above example, every individual URLs must be personally signed by me.
But sometimes I want to allow others to use this service, but with restrictions.
A common restriction is by using URL prefixes.
Instead of signing the whole URL, a URL prefix can be signed instead.

1. Get the URL prefix to sign, and append `*` to it to get a URL pattern.

    ```
    https://wonderful.software/*
    ```

    Also count the prefix length (excluding the `*`), here it is 27 characters.

2. Sign the pattern to generate a signature:

    ```
    QKrnwHJLl7kHMPllMozh38viYGLYvOWH9CRwrtUhMlnEa6Ill3nBEtvasGf1ygFp-tINQj_uyzCni1EsbqWYBw
    ```

3. Construct a signed URL:

    ```
    https://warp.spacet.me/api/go
        ?u=https://wonderful.software/elect-live/pdd/
        &p=27
        &i=automatron
        &s=QKrnwHJLl7kHMPllMozh38viYGLYvOWH9CRwrtUhMlnEa6Ill3nBEtvasGf1ygFp-tINQj_uyzCni1EsbqWYBw
    ```

4. Use the signed URL.
