const http = require ( "http" );
const fs=require('fs');
const url = require ( "url" );
const {insertarUsuarios, consultarUsuarios, editarUsuario, eliminarUsuario, insertarTransferencia, consultarTransferencias}=require('./consultas.js');

http.createServer(async (req, res) => {
// ruta para cargar la pagina HTML en localhost:3000/
    if (req.url == "/" && req.method === "GET" ) {
       fs.readFile("index.html", (err, data)=>{
            if(err){
                res.statusCode=500
                res.end()
            }else{
                res.setHeader( "content-type", "text/html" );
                res.end(data);
            }
        })
    }

//ruta para insertar en la base de datos
    if((req.url=='/usuario' && req.method === "POST")){
        let body=''
        req.on('data',(chunk) => {
            body+=chunk
        });
        req.on('end', async()=>{ 
            const datos = Object.values(JSON.parse(body));
            try{
                const respuesta = await insertarUsuarios(datos);
                res.statusCode=201
                res.end(JSON.stringify(respuesta));
            }catch(e){
                res.statusCode=500
                res.end('Algo salió mal en el servidor :' +e)
            }
        })
    };
// ruta para leer todos los registros de la tabla usuarios en la BD y pintar en HTML
    if(req.url=='/usuarios' && req.method === "GET"){
        try{
            const registros = await consultarUsuarios();
            res.setHeader( "content-type", "application/json" );
            res.end(JSON.stringify(registros));    
        }catch(e){
            res.statusCode=500
            res.end('Algo salió mal en el servidor :' +e)
        }
    };

//ruta para editar un registro (incluí id en el envio desde el frontEnd)
    if (req.url.startsWith("/usuario?id=") && req.method == "PUT" ) {
        req.url.slice(12)
        let body = "" ;
        req.on( "data" , (chunk) => {
            body += chunk;
        });
        req.on( "end" , async () => {
            const datos = Object.values(JSON.parse(body));
            datos.unshift(Number(req.url.slice(12)))
           try{
            const respuesta = await editarUsuario(datos);
            res.statusCode=200
            res.end(JSON.stringify(respuesta));
            }catch(e){
                res.statusCode=500
                res.end('Algo salió mal en el servidor :' +e)
            }
        });
    };
//Ruta para eliminar un usuario de la tabla usuarios
    if (req.url.startsWith("/usuario?id=") && req.method == "DELETE" ) {
        const { id } = url.parse(req.url, true ).query;
        // console.log(id)
        try{
            const respuesta = await eliminarUsuario(id);
            res.end(JSON.stringify(respuesta));
        }catch(e){
            res.statusCode=500
            res.end('Algo salió mal en el servidor :' +e)
        }
    };

//ruta para insertar una transferencia en la base de datos
    if((req.url=='/transferencia' && req.method === "POST")){
        let body=''
        req.on('data',(chunk) => {
            body+=chunk
        });
        req.on('end', async()=>{ 
            const datos = Object.values(JSON.parse(body));
            try{
                const respuesta = await insertarTransferencia(datos);
                res.statusCode=201
                res.end(JSON.stringify(respuesta));
            }catch(e){
                res.statusCode=500
                res.end('Algo salió mal en el servidor :' +e)
            }
        })
    };

    // ruta para leer todos los registros de la tabla transferencias en la BD y pintar en HTML
    if(req.url=='/transferencias' && req.method === "GET"){
        try{
            const registros = await consultarTransferencias();
            res.setHeader( "content-type", "application/json" );
            res.statusCode=200
            res.end(JSON.stringify(registros));    
        }catch(e){
            res.statusCode=500
            res.end('Algo salió mal en el servidor :' +e)
        }
    };

}).listen( 3000, ()=>{ console.log(`Servidor escuchando en el puerto 3000 con PID: ${process.pid}`)} );