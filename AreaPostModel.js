import mongoose from "mongoose";


const PostSchema = new mongoose.Schema(
    {
        Area:String,
        UserId:String,
        UserName:String,
        An: Boolean,
        Re: Boolean,
        Desc:String,
        Course:String,
        Img:String,
    }
);


const AreaPostModel = mongoose.model('AreaPostModel', PostSchema);

export default AreaPostModel;
