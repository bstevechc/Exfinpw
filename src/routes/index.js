const express = require('express');
const router = express.Router();
const pool = require('../database');



router.get('/',async(req,res)=>{
    const webinar =  await pool.query('select id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera;');
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    res.render('index',{webinar,cursos});
});

router.get('/allLinks',async(req,res)=>{
    //const sesiones =  await pool.query('select id_sesion,asignaturas.n_materia, title,n_expositor,n_sesion,descripcion,fecha,img from sesiones, asignaturas WHERE sesiones.id_asignatura = asignaturas.id_asignatura');
    //console.log(sesiones);
    //const fechas =  await pool.query('select fecha from sesiones');
    //console.log(fechas)
    //res.render('links/list',{sesiones});
    const webinar =  await pool.query('select id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera;');
    const cursos =  await pool.query('select * from cursos');
    res.render('public/allLinks',{webinar,cursos});
});



module.exports = router;
