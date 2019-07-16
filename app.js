const http = require('http')
const func = require('./function.js')


const addContentType = (a) => (Object.assign({}, a, {"Content-Type": "application/json"}))

const write = (res, data, code, headers={}) => {
  res.writeHead(code, addContentType(headers))
  res.end(JSON.stringify(data))
}

let vcap = null
const getVCap = () =>{
  if(!vcap) vcap = JSON.parse(process.env.VCAP_SERVICES)
  return vcap
}

const buildContext = async (req) => {
  const services = getVCap()
  const user = req.headers.Authentication
  return {services, user}
}

const buildEvent = (req) => {
  return new Promise(function(resolve, reject){

    var data = '';
    req.on('data', ( chunk ) => {
      data += chunk;
    })

    req.on('end', () => {
      req.rawBody = data;
      if (data && data.indexOf('{') > -1 ) {
        req.body = JSON.parse(data);
      }
      resolve({data:req.body})
    })

    req.on('error', (err)=>{
      reject(err)
    })
  })
}


const handleRequest = async (req) => {
  const event = await buildEvent(req) 
  const context = await buildContext(req)
  const data = await func.run(event,context)
  return {data}
}






// Allow for attaching an init function for database connection etc...
if (func.init) func.init(getVCap())

http.createServer((req,res)=>{
  console.log('Recieved Request')

  handleRequest(req).then(({data, headers})=>{
    const code = !data ? 204 : 200
    write(res, data, code, headers)
  }).catch((err)=>{
    console.log('ERROR: ',err)
    write(res, err || {error: 'Unknown Error'}, 500, headers)
  })

}).listen(process.env.PORT || 8080)


console.log("Server Listening on ", process.env.PORT || 8080)