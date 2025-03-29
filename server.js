const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');  // Asegúrate de importar 'path'
//se ejecuta con http://localhost:5000/admins.html
// Inicializar la app de Express
const app = express();
const port = 5000;

// Conectar a MongoDB
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

// CRUD de Admins (solo accesible por Superadmin)

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

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
