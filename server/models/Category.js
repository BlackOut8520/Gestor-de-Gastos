import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['ingreso', 'gasto']
    },
    color: {
        type: String,
        default: '#3498db' // Un color azul por defecto
    },
    // --- NUEVO CAMPO ---
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Si es null, es una categoría "PÚBLICA/GLOBAL"
    }
});

// Evitar duplicados: Un usuario no puede tener dos categorías con el mismo nombre y tipo
categorySchema.index({ name: 1, type: 1, user: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);