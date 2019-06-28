const http = require('http')
const func = require('./function.js')


const addContentType = (a) => (Object.assign({}, a, {"Content-Type": "application/json"}))

const write = (res, data, code, headers) => {
  res.writeHead(code, addContentType(headers))
  res.end(JSON.stringify(data))
}


http.createServer((req,res)=>{
  console.log('Recieved Request')
  func(req).then((data, headers)=>{
    const code = !data ? 204 : 200
    write(res, data, code, headers)
  }).catch((err, code, headers)=>{
    write(res, err | {error: 'Unknown Error'}, code | 500, headers)
  })
}).listen(process.env.PORT || 8080)


console.log("Server Listening on ", process.env.PORT || 8080)