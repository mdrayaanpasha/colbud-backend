import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        College:String,
        UserId:String,
        UserName:String,
        An: Boolean,
        Re: Boolean,
        Desc:String,
        Course:String,
        Img:String,
    }
);


const PostModel = mongoose.model('PostModel', PostSchema);

export default PostModel;
