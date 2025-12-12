import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Ahora sí leemos la variable del sistema
        // Si por alguna razón no la lee, imprimirá "undefined" en el error
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;