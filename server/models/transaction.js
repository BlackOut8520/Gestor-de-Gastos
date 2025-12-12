import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['ingreso', 'gasto'] 
    },
    // --- NUEVO CAMPO PARA EL CHECK AZUL ---
    isPaid: { 
        type: Boolean, 
        default: false // Por defecto nace como "No pagado" (Pendiente)
    }
});

export default mongoose.model('Transaction', transactionSchema);