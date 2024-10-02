import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    postId:String,
    description:String,
    userId:String,
    userName:String,
    selectedImg:String,
});

const AreaReplyModel = mongoose.model('AreaReplyModel', registerSchema);

export default AreaReplyModel;



