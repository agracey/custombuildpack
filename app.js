const http = require('http')
const func = require('./function.js')


const addContentType = (a) => (Object.assign({}, a, {"Content-Type": "application/json"}))

const write = (res, data, code, headers) => {
  res.writeHead(code, addContentType(headers))
  res.end(JSON.stringify(data))
}

const getData = (req) =>{
  return new Promise(function(resolve){
    console.log(JSON.stringify(req))

    var data = '';
    req.on('data', function( chunk ) {
      data += chunk;
    });

    req.on('end', function() {
      req.rawBody = data;
      if (data && data.indexOf('{') > -1 ) {
        req.body = JSON.parse(data);
      }
      resolve(req.body)
    });
  })



}

http.createServer((req,res)=>{
  console.log('Recieved Request')
  getData(req).then(func).then((data, headers)=>{
    const code = !data ? 204 : 200
    write(res, data, code, headers)
  }).catch((err, code, headers)=>{
    write(res, err | {error: 'Unknown Error'}, code | 500, headers)
  })
}).listen(process.env.PORT || 8080)


console.log("Server Listening on ", process.env.PORT || 8080)