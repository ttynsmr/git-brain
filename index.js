// 🧠git-brain
const cowsay = require('cowsay');
const express = require('express');
const app = express();

app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json({ type: 'application/*+json' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🧠git-brain < I listening ${port}`));

app.get('/', (req, res) => {
  res.send('🧠git-brain');
});

function htmlMessage(text) {
  let style =
    '<style type="text/css"><!-- p {font: small font-family: monospace; white-space: pre} --> </style>';
  let cowMessage = cowsay.say({ text: text, mode: 'y' }).replace(/\r?\n/g, '<br>');
  return `🧠git-brain${style}<br><p class="sample">${cowMessage}</p>`;
}

function textMessage(text) {
  return `🧠git-brain\n${cowsay.say({ text: text, mode: 'y' })}`;
}

// download object
app.get('/cdn/objects/:oid', (req, res) => {
  let text = htmlMessage(
    "I don't know what the number is, but it's status 501.\nAre you sure you want it?\n" +
      req.params.oid,
  );
  res.status(501).send(text);
});

// upload object
app.put('/cdn/objects/:oid', (req, res) => {
  let text = textMessage(
    "I don't know what the number is, but it's status 501.\nOkay. I dropped everything.\n" +
      req.params.oid,
  );
  res.status(501).send(text);
});

// // POST https://lfs-server.com/objects/batch
// // Accept: application/vnd.git-lfs+json
// // Content-Type: application/vnd.git-lfs+json
// // Authorization: Basic ... (if needed)
// {
//   "operation": "download",
//   "transfers": [ "basic" ],
//   "ref": { "name": "refs/heads/main" },
//   "objects": [
//     {
//       "oid": "12345678",
//       "size": 123
//     }
//   ]
// }
app.post('/lfs/:repo/objects/batch', (req, res) => {
  console.log(req.route);
  console.log(req.params);
  console.log(req.header('host'));
  console.log(req.header('Content-Type'));
  console.log(req.header('Accept'));
  console.log(req.header('host'));
  console.log(req.header('host'));
  console.log(req.query);
  console.log(req.body);
  console.log(req.params.repo);
  const expires_in = 3600;
  let now = new Date();
  let expires_at = new Date(now.setSeconds(now.getSeconds() + expires_in));
  responsData = { objects: [] };

  req.body.objects.forEach((o) => {
    responsData.objects.push({
      actions: {
        download: {
          expires_at: `${expires_at.toISOString()}`,
          expires_in: expires_in,
          href: `http://${req.header('host')}/cdn/objects/${o.oid}`,
        },
      },
    });
  });

  res.send(responsData);
});

// Downloads
// Downloading an object requires a download action object in the Batch API response that looks like this:

// {
//   "transfer": "basic",
//   "objects": [
//     {
//       "oid": "1111111",
//       "size": 123,
//       "authenticated": true,
//       "actions": {
//         "download": {
//           "href": "https://some-download.com/1111111",
//           "header": {
//             "Authorization": "Basic ..."
//           },
//           "expires_in": 86400,
//         }
//       }
//     }
//   ]
// }
// The Basic transfer adapter will make a GET request on the href, expecting the raw bytes returned in the HTTP response.

// > GET https://some-download.com/1111111
// > Authorization: Basic ...
// <
// < HTTP/1.1 200 OK
// < Content-Type: application/octet-stream
// < Content-Length: 123
// <
// < {contents}
app.get('/lfs/basic-transfers', (req, res) => {
  res.send({ iam: 'download' });
});

// Uploads
// The client uploads objects through individual PUT requests. The URL and headers are provided by an upload action object.

// {
//   "transfer": "basic",
//   "objects": [
//     {
//       "oid": "1111111",
//       "size": 123,
//       "authenticated": true,
//       "actions": {
//         "upload": {
//           "href": "https://some-upload.com/1111111",
//           "header": {
//             "Authorization": "Basic ..."
//           },
//           "expires_in": 86400
//         }
//       }
//     }
//   ]
// }
// The Basic transfer adapter will make a PUT request on the href, sending the raw bytes returned in the HTTP request.

// > PUT https://some-upload.com/1111111
// > Authorization: Basic ...
// > Content-Type: application/octet-stream
// > Content-Length: 123
// >
// > {contents}
// >
// < HTTP/1.1 200 OK
app.put('/lfs/basic-transfers', (req, res) => {
  res.send({ iam: 'upload' });
});

// Verification
// The Batch API can optionally return a verify action object in addition to an upload action object. If given, The Batch API expects a POST to the href after a successful upload.

// {
//   "transfer": "basic",
//   "objects": [
//     {
//       "oid": "1111111",
//       "size": 123,
//       "authenticated": true,
//       "actions": {
//         "upload": {
//           "href": "https://some-upload.com/1111111",
//           "header": {
//             "Authorization": "Basic ..."
//           },
//           "expires_in": 86400
//         },
//         "verify": {
//           "href": "https://some-verify-callback.com",
//           "header": {
//             "Authorization": "Basic ..."
//           },
//           "expires_in": 86400
//         }
//       }
//     }
//   ]
// }
// Git LFS clients send:

// oid - The String OID of the Git LFS object.
// size - The integer size of the Git LFS object, in bytes.
// > POST https://some-verify-callback.com
// > Accept: application/vnd.git-lfs+json
// > Content-Type: application/vnd.git-lfs+json
// > Content-Length: 123
// >
// > {"oid": "{oid}", "size": 10000}
// >
// < HTTP/1.1 200 OK
app.post('/lfs/basic-transfers', (req, res) => {
  res.send({ iam: 'verify' });
});
