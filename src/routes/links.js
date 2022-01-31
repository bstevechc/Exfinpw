const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const {uuid} = require('uuidv4');

const {isLoggedIn, isNotLoggedIn} = require ('../lib/auth');

const helpers = require('../lib/helpers')






const storage =  multer.diskStorage({
    destination: path.join(__dirname, '../public/uploads'),
    filename: (req,file,cb)=>{
        
        cb(null,uuid()+path.extname(file.originalname).toLocaleLowerCase());
    }
});

const pool = require('../database');
router.get('/add',(req,res)=>{
    res.render('links/add');
});

router.get('/addUser',(req,res)=>{
    res.render('links/addUser');
});
router.get('/addMateria',isLoggedIn,(req,res)=>{
    res.render('links/addMateria');
});

router.get('/',async(req,res)=>{
    const webinar =  await pool.query('select MONTH(fecha) as monthWebinar, id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera and NOW() < fecha;');
    const meses = await pool.query('SELECT MONTH(DATE_ADD(CURDATE(), INTERVAL 0 MONTH)) AS NEXTMONTH, MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)) AS NEXTMONTH2, MONTH(DATE_ADD(CURDATE(), INTERVAL 2 MONTH)) AS NEXTMONTH3,MONTH(DATE_ADD(CURDATE(), INTERVAL 3 MONTH)) AS NEXTMONTH4');
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    const mesesWeb = await pool.query('SELECT MONTH(fecha) from webinar where NOW() < fecha;');

    res.render('links/list',{webinar,cursos,meses:meses[0],mesesWeb});
});


router.get('/cursos',async(req,res)=>{
    const webinar =  await pool.query('select MONTH(fecha) as monthWebinar, id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera and NOW() < fecha;');
    const meses = await pool.query('SELECT MONTH(DATE_ADD(CURDATE(), INTERVAL 0 MONTH)) AS NEXTMONTH, MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)) AS NEXTMONTH2, MONTH(DATE_ADD(CURDATE(), INTERVAL 2 MONTH)) AS NEXTMONTH3,MONTH(DATE_ADD(CURDATE(), INTERVAL 3 MONTH)) AS NEXTMONTH4');
    const cursos2 =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    const mesesWeb = await pool.query('SELECT MONTH(fecha) from webinar where NOW() < fecha;');

    res.render('links/listCursos',{cursos2});
});


router.post('/add',async (req, res)=>{
    const{tema, url, description, fecha}=req.body;
    const newLink = {
        tema,
        url,
        description,
        fecha
    };
    
    //await pool.query('INSER INTO users SET ?',[newLink])
    res.send('received');
})

router.post('/addUser',async (req, res)=>{
    tipo_user = 1;
    const{ nombres, apellidos, password,email}=req.body;
    const newUser = {
        nombres,
        apellidos,
        password,
        tipo_user,
        email
    };
    
    await pool.query('INSERT INTO usuario set ?',[newUser])
    res.send('received User');
});

router.post('/addMateria', async(req,res)=>{
    const{n_materia,sede,carrera}=req.body;
    const newMateria = {
        n_materia,
        sede,
        carrera
    }
    await pool.query('INSERT INTO asignaturas SET ?',[newMateria])
    res.send('received Materia')
});

//ver detalles curso
router.get('/detalles/:id_curso',isLoggedIn, async(req,res)=>{
    const {id_curso} = req.params;
    const cursos =  await pool.query('SELECT id_curso, expositores.foto,expositores.descripcion as titulo, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera and id_curso = ?;',[id_curso]);
    notificacion = await pool.query('select notificaciones,id_curso from cursos_users where id_user = ? and id_curso = ?',[req.user.id_user, id_curso])
    res.render('links/detallesCurso',{cursos,notificacion:notificacion[0],id_curso:req.params});
});

//ver detalles webinar
router.get('/detallesW/:id_webinar', async(req,res)=>{
    const {id_webinar} = req.params;
    const notificacion = await pool.query('select notificaciones,id_webinar from webinar_users where id_user = ? and id_webinar = ?',[req.user.id_user, id_webinar])
    const webinar =  await pool.query('select MONTH(fecha) as monthWebinar, id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido, expositores.foto,expositores.descripcion as cargo from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera and id_webinar= ?;',[id_webinar]);
    res.render('links/detallesWeb',{webinar,notificacion:notificacion[0],id_webinar:req.params});
});


router.get('/gest_sesiones', async(req,res)=>{
    res.send('Gestionar Sesiones');
});


router.get('/gest_sesiones/sendEmail', async(req,res)=>{
    res.render('links/emails');
});

router.get('/image',async(req,res)=>{
    res.render('links/upimage');
})

const uploadIMG = multer({
    storage,
    dest: path.join(__dirname, 'public/uploads'),
    limits: {fileSize: 2000000},
    fileFilter: (req,file,cb) =>{
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));
        if(mimetype  && extname){
            return cb(null,true);
        }
        cb("Error: Archivo debe ser una imagen valida");
    }
}).single('foto')

router.post('/image/add',uploadIMG, async(req,res)=>{
    res.send('imagen guardada');
});

router.post('/gest_sesiones/sendEmail/res', async(req,res)=>{
    const{name, email, title, description} = req.body;

    contenidoEmail = `
        <h1> Test Correo </h1>
        <ul>
            <li> Username: ${name} </li>
            <li> Email: ${email} </li>
            <li> Title: ${title} </li>
        </ul>
        <p>
            ${description}
        </p>
    `;
    

    res.send('Envio de correos exitoso');
});



//Agregar Expositores

router.get('/addExp',isLoggedIn,(req,res)=>{
    res.render('links/addExp');
});

router.post('/resExp',isLoggedIn,uploadIMG,async (req, res)=>{
    const foto = req.file.filename;
    const{ nombre, apellido, descripcion}=req.body;
    
    const newExp = {
        nombre,
        apellido,
        descripcion,
        foto
    };
    await pool.query('INSERT INTO expositores set ?',[newExp])
    res.send('received User');
});

//Agregar Carrera
router.get('/addCarr',isLoggedIn,(req,res)=>{
    res.render('links/addCarrera');
});

router.post('/resCarrera',isLoggedIn,async (req, res)=>{
    const{ n_carrera, sede}=req.body;
    const newCarr = {
        n_carrera,
        sede
    };
    await pool.query('INSERT INTO carrera set ?',[newCarr])
    res.send('received Carrera');
});


//Agregar webinar
router.get('/addWeb',isLoggedIn, async(req,res)=>{
    const expositores =  await pool.query('select nombre, apellido, id_expositor from expositores;');
    const carreras =  await pool.query('select n_carrera from carrera;');
    if (req.user.tipo_user == 1){
        req.logOut();
        req.flash('messages2','Ingrese desde un perfil administrador para cargar esta direccion');
        res.redirect('../signin');

    }else
        res.render('links/addWebinar',{expositores,carreras});
});

router.post('/resWeb',isLoggedIn,uploadIMG,async(req,res)=>{
    const img = req.file.filename;
    const {id_carrera, title, n_sesion, descripcion, fecha, id_expositor} = req.body;
    const newWeb={
        id_carrera,
        title,
        n_sesion,
        descripcion,
        fecha,
        img,
        id_expositor
    }
    await pool.query('INSERT INTO webinar set ?',[newWeb])
    res.redirect('/links/allWebinar');
});

//Ver todos los webinares y cursos
router.get('/allwebinar',isLoggedIn, async(req,res)=>{
    const webinar =  await pool.query('select id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera;');
    const cursos =  await pool.query('select * from cursos');
    res.render('links/allweb',{webinar,cursos});
});

router.get('/allcursos',isLoggedIn, async(req,res)=>{
const cursos =  await pool.query('select * from cursos');
    res.render('links/allcur',{cursos});
});

//Eliminar webinar

router.get('/deleteWeb/:id_webinar',isLoggedIn, async(req,res)=>{
    const {id_webinar} = req.params;
    
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        await pool.query('DELETE FROM webinar where id_webinar = ?',[id_webinar])
        res.redirect('/links/allwebinar')
});

//Eliminar Curso

router.get('/deleteCur/:id_curso',isLoggedIn, async(req,res)=>{
    const {id_curso} = req.params;
    
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        await pool.query('DELETE FROM cursos where id_curso = ?',[id_curso])
        res.redirect('/links/allcursos')
});

//Editar webinar desplegar form con datos

router.get('/editWeb/:id_webinar',isLoggedIn,async(req,res)=>{
    const expositores =  await pool.query('select nombre, apellido, id_expositor from expositores;');
    const carreras =  await pool.query('select id_carrera,n_carrera from carrera;');
    const {id_webinar} = req.params;
    const webinar =  await pool.query('SELECT id_webinar,webinar.id_carrera,title,n_sesion,webinar.descripcion,fecha,img,webinar.id_expositor , carrera.n_carrera , expositores.nombre , expositores.apellido FROM webinar,carrera,expositores where webinar.id_carrera = carrera.id_carrera and webinar.id_expositor = expositores.id_expositor and id_webinar  = ?;',[id_webinar]);
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        res.render('links/editWeb',{webinar,expositores,carreras,webinar2:webinar[0]});
});
//Editar Curso
router.get('/editCurso/:id_curso',isLoggedIn,async(req,res)=>{
    const expositores =  await pool.query('select nombre, apellido, id_expositor from expositores;');
    const carreras =  await pool.query('select id_carrera,n_carrera from carrera;');
    const {id_curso} = req.params;
    const cursos = await pool.query('SELECT cursos.id_curso,cursos.id_carrera,title,modalidad,cursos.descripcion,fecha_in,fecha_fin,sitio,duracion,costo,cupos,img,linkRegistro,cursos.id_expositor, apellido, nombre, expositores.descripcion as cargo, foto, n_carrera,sede from cursos, expositores, carrera where  cursos.id_carrera = carrera.id_carrera and expositores.id_expositor = cursos.id_expositor and id_curso = ?;',[id_curso])
    //const webinar =  await pool.query('SELECT id_webinar,webinar.id_carrera,title,n_sesion,webinar.descripcion,fecha,img,webinar.id_expositor , carrera.n_carrera , expositores.nombre , expositores.apellido FROM webinar,carrera,expositores where webinar.id_carrera = carrera.id_carrera and webinar.id_expositor = expositores.id_expositor and id_webinar  = ?;',[id_webinar]);
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        //res.render('links/editCursos',{webinar,expositores,carreras,webinar2:webinar[0]});
        console.log(cursos)
        res.render('links/editCurso',{expositores,carreras,cursos2:cursos[0]});
        
});

//Editar webinar envio de datos
router.post('/editWeb/res/:id_webinar',isLoggedIn, async(req,res)=>{
    const {id_webinar} = req.params;
    const{fecha} = req.body;
    const{fotoNew} = req.body;
    const {id_carrera,title,n_sesion,descripcion,id_expositor} = req.body;
    const editWeb = {
        id_carrera,
        title,
        n_sesion,
        descripcion,
        fecha,
        id_expositor
    };
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        pool.query('UPDATE webinar set ? where id_webinar = ?', [editWeb,id_webinar])
        res.redirect('/links/allWebinar');
});

//Editar curso
router.post('/editCur/res/:id_curso',isLoggedIn, async(req,res)=>{
    const {id_curso} = req.params;
    var fecha_in = req.body.fecha_in;
    old_fecha = await pool.query('SELECT fecha_in, fecha_fin from cursos where id_curso = ?',[id_curso])
    console.log("Fecha Inicio")
    if(fecha_in == ""){
        fecha_in = old_fecha[0].fecha_in
    }
    console.log(fecha_in)
    var fecha_fin = req.body.fecha_fin;
    console.log("Fecha Fin")
    if(fecha_fin == ""){
        fecha_fin = old_fecha[0].fecha_fin
    }
    console.log(fecha_fin)

    const {id_carrera,title,modalidad,descripcion,costo,cupos,sitio,duracion,linkRegistro,id_expositor} = req.body;
    const editCur = {
        id_carrera,
        title,
        modalidad,
        descripcion,
        fecha_in,
        fecha_fin,
        sitio,
        duracion,
        costo,
        cupos,
        linkRegistro,
        id_expositor
    };
    console.log(editCur)

    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        await pool.query('UPDATE cursos set ? where id_curso = ?', [editCur,id_curso])
        res.redirect('/links/allWebinar');
});

router.get('/editWeb/res/img/:id_webinar',isLoggedIn, async(req,res)=>{
    const{id_webinar} = req.params;
    const webinar2 =  await pool.query('SELECT id_webinar,webinar.id_carrera,title,n_sesion,webinar.descripcion,fecha,img,webinar.id_expositor , carrera.n_carrera , expositores.nombre , expositores.apellido FROM webinar,carrera,expositores where webinar.id_carrera = carrera.id_carrera and webinar.id_expositor = expositores.id_expositor and id_webinar  = ?;',[id_webinar]);
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        res.render('links/upimage',{webinar:webinar2[0]});
});

router.post('/editWeb/res/img/:id_webinar',isLoggedIn,uploadIMG, async(req,res)=>{
    const{id_webinar} = req.params;
    const img = req.file.filename;
    const newIMG={
        img
    }
    pool.query('UPDATE webinar set ? where id_webinar = ?', [newIMG,id_webinar])
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        res.redirect("/links/editWeb/"+id_webinar)
});


//Agregar Curso
router.get('/addCurso',isLoggedIn,async(req,res)=>{
    const expositores =  await pool.query('select nombre, apellido, id_expositor from expositores;');
    const carreras =  await pool.query('select n_carrera from carrera;');

    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        res.render('links/addCurso',{expositores, carreras})
});

router.post('/resCur',isLoggedIn,uploadIMG,async(req,res)=>{
    const img = req.file.filename;
    const {id_carrera, title, modalidad, descripcion,fecha_in,
         fecha_fin,costo,cupos,linkRegistro,sitio, duracion, id_expositor} = req.body;
    const newCur={
        id_carrera,
        title,
        modalidad,
        descripcion,
        fecha_in,
        fecha_fin,
        sitio,
        duracion,
        costo,
        cupos,
        img,
        linkRegistro,
        id_expositor

    }
    await pool.query('INSERT INTO cursos set ?',[newCur])
    //res.redirect('/links/allCursos');
    if (req.user.tipo_user == 1){
        req.logOut();
        res.redirect('../signin');
    }else
        res.redirect('/links/gestCurso')
});

//Recibir Notificaciones Cursos

router.get('/sendNoti/:id_curso',isLoggedIn, async(req,res)=>{
    const{id_curso} = req.params;
    
    const newNoti={
        id_user:req.user.id_user,
        id_curso,
        notificaciones: 1,
        calificacion:0,
        comentario: "Vacio"
    }
    await pool.query('INSERT INTO cursos_users set ?', [newNoti]);
    req.flash('messages2','Recibira un correo pocos dias de empezar este curso');
    res.redirect("/links/detalles/"+id_curso);
});

router.get('/cancelNoti/:id_curso',isLoggedIn, async(req,res)=>{
    const{id_curso} = req.params;
    console.log(id_curso);
    await pool.query('DELETE FROM cursos_users where id_curso = ? and id_user = ?', [id_curso,req.user.id_user]);
    req.flash('messages','Se cancelo el recibir notificaciones');
    res.redirect("/links/detalles/"+id_curso)
});

//Recibir notificaciones Webinar
router.get('/sendNotiW/:id_webinar',isLoggedIn, async(req,res)=>{
    const{id_webinar} = req.params;
    
    const newNoti={
        id_user:req.user.id_user,
        id_webinar,
        notificaciones: 1,
        calificacion:0,
        comentario: "Vacio"
    }
    await pool.query('INSERT INTO webinar_users set ?', [newNoti]);
    req.flash('messages2','Recibira un correo pocos dias de empezar este curso');
    res.redirect("/links/detallesW/"+id_webinar);
});

router.get('/cancelNotiW/:id_webinar',isLoggedIn, async(req,res)=>{
    const{id_webinar} = req.params;
    await pool.query('DELETE FROM webinar_users where id_webinar = ? and id_user = ?', [id_webinar,req.user.id_user]);
    req.flash('messages','Se cancelo el recibir notificaciones');
    res.redirect("/links/detallesW/"+id_webinar)
});


router.get('/Notif',isLoggedIn, async(req,res)=>{
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    const webinar = await pool.query('select id_webinar, expositores.descripcion,fecha, img, title,expositores.nombre, expositores.apellido, carrera.n_carrera from webinar, expositores, carrera where webinar.id_expositor = expositores.id_expositor AND webinar.id_carrera = carrera.id_carrera ')
    res.render('links/notificacion',{cursos, webinar})
})

router.get('/Notif/sendemails/:id_curso',isLoggedIn, async(req,res)=>{
    const{id_curso} = req.params;
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera and cursos.id_curso = ?',[id_curso]);
    const emails = await pool.query('SELECT email from cursos_users, usuario WHERE cursos_users.id_user = usuario.id_user and id_curso = ?',[id_curso])
    console.log(emails)
    res.render('links/emails',{cursos:cursos[0],emails})
})

router.get('/Notif/sendemailsW/:id_webinar',isLoggedIn, async(req,res)=>{
    const{id_webinar} = req.params;
    const webinar =  await pool.query('SELECT * from webinar WHERE id_webinar= ?',[id_webinar]);
    const emails = await pool.query('SELECT email from webinar_users, usuario WHERE webinar_users.id_user = usuario.id_user and id_webinar = ?',[id_webinar])
    console.log(emails)
    res.render('links/emailsW',{webinar:webinar[0],emails})
})

router.get('/calificacion',isLoggedIn,(req,res)=>{
    
    res.render('links/rating');
});

router.post('/calificacion',isLoggedIn,(req,res)=>{
    console.log(req.body)
    res.render('links/rating');
});

//panel Administrador Webinares
router.get('/gestWebinar', isLoggedIn,async(req,res)=>{

    const webinar =  await pool.query('select MONTH(fecha) as monthWebinar, id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera;');
    const meses = await pool.query('SELECT MONTH(DATE_ADD(CURDATE(), INTERVAL 0 MONTH)) AS NEXTMONTH, MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)) AS NEXTMONTH2, MONTH(DATE_ADD(CURDATE(), INTERVAL 2 MONTH)) AS NEXTMONTH3,MONTH(DATE_ADD(CURDATE(), INTERVAL 3 MONTH)) AS NEXTMONTH4');
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    const mesesWeb = await pool.query('SELECT MONTH(fecha) from webinar where NOW() < fecha;');

    res.render('links/mainWebinar',{webinar,meses:meses[0],mesesWeb});
})

router.get('/gestCurso', isLoggedIn,async(req,res)=>{

    const webinar =  await pool.query('select MONTH(fecha) as monthWebinar, id_webinar, carrera.n_carrera, title, n_sesion, webinar.descripcion, fecha, img, expositores.nombre, expositores.apellido from webinar,  expositores,carrera where webinar.id_expositor = expositores.id_expositor and webinar.id_carrera = carrera.id_carrera;');
    const meses = await pool.query('SELECT MONTH(DATE_ADD(CURDATE(), INTERVAL 0 MONTH)) AS NEXTMONTH, MONTH(DATE_ADD(CURDATE(), INTERVAL 1 MONTH)) AS NEXTMONTH2, MONTH(DATE_ADD(CURDATE(), INTERVAL 2 MONTH)) AS NEXTMONTH3,MONTH(DATE_ADD(CURDATE(), INTERVAL 3 MONTH)) AS NEXTMONTH4');
    const cursos =  await pool.query('SELECT id_curso, n_carrera, title, modalidad, cursos.descripcion, fecha_in, fecha_fin, sitio,duracion,costo,cupos,img,linkRegistro,nombre, apellido from expositores, carrera, cursos where expositores.id_expositor = cursos.id_expositor and carrera.id_carrera = cursos.id_carrera');
    const mesesWeb = await pool.query('SELECT MONTH(fecha) from webinar where NOW() < fecha;');

    res.render('links/mainCursos',{cursos});
})

//Enviar Comentarios Webinar

router.get('/SendC_Web/:id_webinar', isLoggedIn, async(req,res)=>{
    const {id_webinar} = req.params
    const webinar =  await pool.query('select id_webinar,  title from webinar where id_webinar = ? ;',[id_webinar]);
    res.render('links/feedbackWeb',{webinar2:webinar[0]})
})

router.post('/SendC_Web/:id_webinar', isLoggedIn, async(req,res)=>{
    const{id_webinar} = req.params
    const {descripcion,nota} = req.body
    const newComent = {
        descripcion,
        nota,
        id_webinar,
        id_user:req.user.id_user

    }
    console.log(newComent)
    await pool.query('INSERT INTO webinar_comentarios set ?', [newComent]); 
    res.redirect("/links/detallesW/"+id_webinar)
})


//Enviar Comenarios Curso

router.get('/SendC_Cur/:id_curso', isLoggedIn, async(req,res)=>{
    const {id_curso} = req.params
    const cursos =  await pool.query('select id_curso,  title from cursos where id_curso = ? ;',[id_curso]);
    res.render('links/feedbackCursos',{cursos2:cursos[0]})
})

router.post('/SendC_Cur/:id_curso', isLoggedIn, async(req,res)=>{
    const{id_curso} = req.params
    const {descripcion,nota} = req.body
    const newComent = {
        descripcion,
        nota,
        id_curso,
        id_user:req.user.id_user

    }
    console.log(newComent)
    await pool.query('INSERT INTO cursos_comentarios set ?', [newComent]); 
    res.redirect("/links/detalles/"+id_curso)
})

router.get('/config', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select email,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    //usuario[0].password = await helpers.encryptPassword(usuario[0].password);
    //await helpers.matchPassword(password, user.password)
    console.log(usuario)
    res.render('links/config',{usuario2:usuario[0]})
})

router.post('/config', isLoggedIn, async(req,res)=>{
    const usuario =  await pool.query('select email,nombres,apellidos,password from usuario where id_user = ? ;',[req.user.id_user]);
    const {nombres,apellidos,oldpassword,newpassword} = req.body
    if(await helpers.matchPassword(oldpassword, usuario[0].password)){
        console.log("Son las mismas :)")
        newpassword2 = await helpers.encryptPassword(newpassword);
        console.log(newpassword2)
        const newDatos = {
            nombres,
            apellidos,
            password:newpassword2
        }
        console.log(newDatos)
        req.flash('messages2','Datos Actualizados correctamente');
        pool.query('UPDATE usuario set ? where id_user = ?', [newDatos,req.user.id_user])
    }
    else{
        req.flash('messages','Intente de nuevo, password incorrecto');
        console.log("No son las mismas :(")
    }

    
    res.redirect('/links/config')
})


module.exports = router;