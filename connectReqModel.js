import mongoose from "mongoose";

const registerSchema = new mongoose.Schema({
    
        post_id: String,
        PosterEmail: String,
        PosterName:String,
        PosterImg:String,
        PosterCourse:String,
        RequesterEmail: String,
        RequesterName: String,
        Status: Boolean,
        RequesterImg:String,
        RequesterCourse:String,
        RequesterId:String,
      
});

const ConReqModel = mongoose.model('ConReqModel', registerSchema);

export default ConReqModel;
