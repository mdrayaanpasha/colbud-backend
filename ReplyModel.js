import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    postId:String,
    description:String,
    userId:String,
    userName:String,
    selectedImg:String,
});

const ReplyModel = mongoose.model('ReplyModel', registerSchema);

export default ReplyModel;



