# make new certs #

You need to establish a secure local connection otherwise you cannot set cookies.

Modern browsers (e.g., Chrome since version 58) require the certificate to include a Subject Alternative Name (SAN) field listing the domain. The CN alone isn’t sufficient anymore.
So update the san.cnf with your domain name for CN and DNS.1 

```bash
cd packages/web/src/certs
```

Update the san.cnf file with your local domain name.

From this folder run this command:  

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -config san.cnf
```

```bash
openssl x509 -in cert.pem -text -noout | grep -A 3 "Key Usage"
```

Add it to Keychain and trust:
Right click the file and select reveal in finder (for mac os)
open Keychain and drag the cert.pem file into Keychain
right click the new entry, select get info
in the trust section select 'trust always'
refresh keychain and check for blue plus mark next to the imported cert
close keychain and restart the browser

```bash
open ./cert.pem
```
