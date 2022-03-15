const { Pool } = require ( "pg" );

const config={
    user: "fidonoso_desafiolatam" ,
    host: "postgresql-fidonoso.alwaysdata.net" ,
    password: "desafio1234" ,
    database: "fidonoso_bancosolar",
    port: 5432 ,
    max: 20,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000,
}
const pool = new Pool(config);

// funcion para agregar un nuevo usuario a la BD
const insertarUsuarios = async (datos) => {
    const consulta={
        text: "INSERT INTO usuarios (nombre, balance) values($1, $2)",
        values: datos
    };
    try{
    const result = await pool.query( consulta );
    return result;
    }catch(e){
        console.log(e.code)
        return e
    }
};

//funcion para consultar todas las canciones en la BD y pintarlas en el HTML
const consultarUsuarios=async ()=>{
    try {
        const result = await pool.query( "SELECT * FROM usuarios;" );
        return result.rows;
        } catch (error) {
        console .log(error.code);
        return error
        }
};
//funcion para editar un usuario por id
const editarUsuario = async (datos) => {
    const consulta = {
        text: `UPDATE usuarios SET nombre = $2, balance = $3  WHERE id = $1 RETURNING *` ,
        values: datos,
    };
    try {
        const result = await pool.query(consulta);
        return result;
    } catch (error) {
        console .log(error);
        return error;
    }
};
//funcion para eliminar un usuario
const eliminarUsuario = async (id) => {
    try {
        const result = await pool.query(`DELETE FROM usuarios WHERE id =${id};`);
        console.log(`Registros afectados : ${result.rowCount}`)
        return result;
    } catch (error) {
        console.log(`Error :${error.code}`);
        console.log(`Puede que haya intentado eliminar un usuario que ha realizado o recibido transferencias de otros usuarios.`);
        console.log({
            Código: error.code,
            detalle: error.detail,
            tabla: error.table,
            Constraint: error.constraint})
        return error;
    }
};

//funcion para insertar una transferencia en la bd
const insertarTransferencia = async (datos) => {
    let fecha=new Date()
    let mes= fecha.getMonth()+1<10?'0'+(fecha.getMonth()+1):fecha.getMonth()+1;
    let dia=fecha.getDate()<10?'0'+fecha.getDate():fecha.getDate();
    datos.push(`${fecha.getFullYear()}/${mes}/${dia} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`)
    console.log(datos)
    const actualizarBalanceEmisor = {
        text: "UPDATE usuarios SET balance = balance - $2 WHERE id = $1",
        values: [datos[0], datos[2]]
    };
    const actualizarBalanceReceptor = {
        text: "UPDATE usuarios SET balance = balance + $2 WHERE id = $1",
        values: [datos[1], datos[2]]
    };
    const registrarTransferencia = {
        text: `INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, $4) RETURNING *;` ,
        values: datos
    };
    try {
        await pool.query("BEGIN")
        console.log('Comenzando transacción...')
        await pool.query(actualizarBalanceEmisor);
        console.log('Actualizando cuenta del emisor...')
        await pool.query(actualizarBalanceReceptor);
        console.log('Actualizando cuenta del Receptor...')
        await pool.query(registrarTransferencia);
        console.log('Ingresando registro de transferencias..')
        await pool.query("COMMIT");
        console.log('La transacción se realizó correctamente')
    } catch (error) {
        await pool.query("ROLLBACK");
        console.log('La transacción falló. No se realizaron cambios')
        console.log("Error: ",error);
        return error;
    }
};

const consultarTransferencias=async ()=>{
    const consulta = {
        rowMode: 'array',
        text: "SELECT transferencias.id, usuarios.nombre as emisor, u2.nombre as receptor, monto, fecha FROM transferencias inner join usuarios on usuarios.id=transferencias.emisor inner join usuarios u2 on u2.id=transferencias.receptor;",
    };
    try{
        const result = await pool.query(consulta);
        return result.rows;
    }catch(error){
        console .log(error.code);
        return error
    }
}

module.exports={insertarUsuarios, consultarUsuarios, editarUsuario, eliminarUsuario, insertarTransferencia, consultarTransferencias}