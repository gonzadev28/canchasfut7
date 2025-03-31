const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');  


const app = express();
const port = 5000;

// Conecta a mongoDB
const mongoURI = 'mongodb+srv://CesarPainemal:cesarpainemal@clustercanchafut.ivvtwr0.mongodb.net/miBaseDeDatos?retryWrites=true&w=majority';

mongoose.connect(mongoURI)
  .then(() => console.log('Conexión exitosa a MongoDB'))
  .catch((err) => console.log('Error de conexión a MongoDB:', err));

// Middleware
app.use(cors());  // Usar CORS para permitir peticiones desde el frontend
app.use(express.json()); // Middleware para procesar JSON

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
    const { username, password } = req.body;

    // Buscar el admin por el nombre de usuario
    const admin = await Admin.findOne({ username });
    if (!admin) {
        return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña con la guardada en la base de datos
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Si las credenciales son correctas, responder con un mensaje de éxito
    res.status(200).json({ message: 'Login exitoso' });
});
//-------------------------------------------------------------------------------
const CanchaSchema = new mongoose.Schema({
    nombre: String
});
const Cancha = mongoose.model('Cancha', CanchaSchema);

// Obtener todas las canchas
app.get('/canchas', async (req, res) => {
    const canchas = await Cancha.find();
    res.json(canchas);
});

// Crear cancha
app.post('/canchas', async (req, res) => {
    const { nombre } = req.body;
    const cancha = new Cancha({ nombre });
    await cancha.save();
    res.json({ message: 'Cancha agregada correctamente' });
});

// Eliminar cancha
app.delete('/canchas/:id', async (req, res) => {
    await Cancha.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cancha eliminada correctamente' });
});
//-------------------------------------------------------------------
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
