let static = require('node-static')
let http = require('http')

let file = new static.Server('./dist')

const PORT = 8080

http.createServer(function (request, response) {
  request.addListener('end', function () {
    console.error("DD: ENDPOINT")
    file.serve(request, response)
  }).resume()
}).listen(process.env.PORT || PORT)
console.log(`Server started on port: ${PORT}`)
