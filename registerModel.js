import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    name: String,
    password: String,
    email: String,
    area: String,
    college: String,
    course: String,
    Description: String,
    selectedImg: String,
    Connections:Array
});

const RegisterModel = mongoose.model('RegisterModel', registerSchema);

export default RegisterModel;
