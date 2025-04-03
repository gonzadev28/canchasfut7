const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');//peticion de front a back
const bcrypt = require('bcrypt');
const path = require('path');  //ruta archivos


const app = express();
const port = 5000;

// Conecta a mongoDB
const mongoURI = 'mongodb+srv://CesarPainemal:cesarpainemal@clustercanchafut.ivvtwr0.mongodb.net/miBaseDeDatos?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.log('Error de conexión a MongoDB:', err));

// Middleware
app.use(cors());  // Usar CORS para permitir peticiones desde el frontend
app.use(express.json()); // para procesar JSON

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Modelos

const AdminSchema = new mongoose.Schema({
    username: String,
    password: String
});
const Admin = mongoose.model('Admin', AdminSchema);

// Crear admin
app.post('/superadmin/admins', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    res.json({ message: 'Administrador creado correctamente' });
});

// Obtener todos los admins
app.get('/superadmin/admins', async (req, res) => {
    const admins = await Admin.find({}, 'username _id');
    res.json(admins);
});

// Actualizar admin
app.put('/superadmin/admins/:id', async (req, res) => {
    const { username, password } = req.body;
    const updateData = { username };
    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }
    await Admin.findByIdAndUpdate(req.params.id, updateData);
    res.json({ message: 'Administrador actualizado correctamente' });
});

// Eliminar admin
app.delete('/superadmin/admins/:id', async (req, res) => {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Administrador eliminado correctamente' });
});
// Ruta de inicio de sesión para login ------------------------------------------
app.post('/login', async (req, res) => {
    console.log("Datos recibidos en /login:", req.body);

    const { username, password } = req.body;
    if (!username || !password) {
        console.log("Faltan datos");
        return res.status(400).json({ message: 'Faltan datos' });
    }

    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            console.log("Usuario no encontrado:", username);
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            console.log("Contraseña incorrecta para:", username);
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        console.log("Login exitoso para:", username);
        res.status(200).json({ message: 'Login exitoso', adminId: admin._id });


    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

//-------------------------------------------------------------------------------
const CanchaSchema = new mongoose.Schema({
    nombre: String,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' } // Referencia al admin
});

const Cancha = mongoose.model('Cancha', CanchaSchema);

// Obtener solo las canchas del admin autenticado
app.get('/canchas', async (req, res) => {
    // Asumiendo que el adminId está pasando en el encabezado de la solicitud o en el cuerpo
    const adminId = req.query.adminId; // Puedes obtenerlo como parámetro de consulta o de algún otro lugar

    if (!adminId) {
        return res.status(400).json({ message: 'No se proporcionó adminId' });
    }
    console.log("Buscando canchas para adminId:", adminId);
    // Filtrar las canchas solo por adminId
    const canchas = await Cancha.find({ adminId: adminId }).populate('adminId', 'username _id'); // Solo las canchas del admin logueado
    res.json(canchas);
});

// Crear cancha
app.post('/canchas', async (req, res) => {
    const { nombre, adminId } = req.body; // adminId será el _id del admin logueado
    const cancha = new Cancha({ nombre, adminId });
    await cancha.save();
    res.json({ message: 'Cancha agregada correctamente' });
});

// Eliminar cancha
app.delete('/canchas/:id', async (req, res) => {
    await Cancha.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cancha eliminada correctamente' });
});
//-------------------------------------------------------------------
// Modelo de Reserva
const ReservaSchema = new mongoose.Schema({
    cancha_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cancha' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    fecha: String,
    hora: String,
    usuario: String
  }, { timestamps: true });
  
  const Reserva = mongoose.model('Reserva', ReservaSchema);
  
  // Endpoint para disponibilidad (agrega validación)
app.get('/reservas/disponibilidad', async (req, res) => {
    try {
      const { cancha_id, fecha, hora } = req.query;
      
      if (!mongoose.Types.ObjectId.isValid(cancha_id)) {
        return res.status(400).json({ error: 'ID de cancha inválido' });
      }
  
      const existeReserva = await Reserva.findOne({ cancha_id, fecha, hora });
      res.json({ disponible: !existeReserva });
    } catch (error) {
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
  // Endpoint para crear reserva (agrega validación)
  app.post('/reservas', async (req, res) => {
    try {
      const { cancha_id, admin_id, fecha, hora, usuario } = req.body;
      
      if (!mongoose.Types.ObjectId.isValid(cancha_id) || !mongoose.Types.ObjectId.isValid(admin_id)) {
        return res.status(400).json({ error: 'IDs inválidos' });
      }
  
      const nuevaReserva = new Reserva({ cancha_id, admin_id, fecha, hora, usuario });
      await nuevaReserva.save();
      
      res.json({ success: true, message: 'Reserva exitosa' });
    } catch (error) {
      res.status(500).json({ error: 'Error al guardar la reserva' });
    }
  });
//-----------------------------------------------------------------------------
// Endpoints
app.get('/canchas/:id', async (req, res) => {
    try {
        const cancha = await Cancha.findById(req.params.id).populate('adminId');
        if (!cancha) {
            return res.status(404).json({ message: 'Cancha no encontrada' });
        }
        res.json(cancha);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar cancha' });
    }
});

app.get('/reservas/admin/:admin_id', async (req, res) => {
    try {
        const reservas = await Reserva.find({ admin_id: req.params.admin_id })
            .populate('cancha_id', 'nombre')
            .sort({ fecha: 1, hora: 1 }); // Ordenar por fecha y hora
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
});
//---------------------------------------------------------------------------------
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});