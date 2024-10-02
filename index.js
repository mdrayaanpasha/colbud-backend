import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import mongoose, { connections } from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
    origin: 'http://localhost:5173'
}));


//db stuff.
const dburl = "mongodb+srv://riyazpasha12oct:COLBUD1543@cluster0.tlhbv.mongodb.net/colbud?retryWrites=true&w=majority";

const connectionParams = {
    useNewUrlParser:true,
    useUnifiedTopology:true
}

mongoose.connect(dburl,connectionParams)
.then(()=>console.log("connected to DB"))
.catch(err=>console.log(err))


import RegisterModel from "./registerModel.js";
import ConReqModel from "./connectReqModel.js";
import PostModel from "./PostModel.js";
import ReplyModel from "./ReplyModel.js";
import AreaPostModel from "./AreaPostModel.js";
import AreaReplyModel from "./AreaReply.js";


app.get("/",async(req,res)=>{
    res.send("hello")
})
app.get("/test-101",async(req,res)=>{
    res.send({message:"workin bruh!"})
})

app.get("/test",async(req,res)=>{
    res.send({yello:"heloo"})
})
app.post("/registerUser",async(req,res)=>{
    const Data = req.body.D
    try {
        const D = await RegisterModel.find({email:Data.email})
        if(D.length > 0){
            res.send({message:"exist"})
        }else{
            await RegisterModel.create(Data); // Correct method to insert data
            res.send({ message: "made" });
        }
        
    } catch (error) {
        console.log(error);
        res.send({ message: false });
    }
})
app.post("/logUser",async(req,res)=>{
    const Data = req.body.D 
    try {
        const D = await RegisterModel.find({email:Data.email})
        if(D.length > 0){
            if(D[0].password === Data.password){
                res.send({message:"done"})
            }else{
                res.send({message:"wrong"})
            }
        }else{
        
            res.send({ message: "not" });
        }
        
    } catch (error) {
        console.log(error);
        res.send({ message: false });
    }
})

function RefMe(d,Email){
    let newArr = []
    d.forEach(element => {
        if (element.email !== Email){
            element.password=""
            newArr.push(element)
        }
    });
    return newArr
}

app.post("/feedPage", async (req, res) => {
    const Email = req.body.email;
    let BrosCollege;
    let BrosArea;
    let RawData;
    let BrosConnections;

    try {
        // Fetch user's college and area
        RawData = await RegisterModel.findOne({ email: Email });
        if (!RawData) {
            return res.send({ message: false, error: "User not found" });
        }
        BrosCollege = RawData.college;
        BrosArea = RawData.area;
        BrosConnections=RawData.Connections
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.send({ message: false, error: "Error fetching user data" });
    }

    try {
        // Fetch users with the same college and area
        let Refined = await RegisterModel.find({ college: BrosCollege, area: BrosArea });

        //this just removes me from the Data
        Refined = RefMe(Refined, Email); 
        let N;
      
        try {
            const C = await ConReqModel.find({ RequesterEmail: Email }); 
            N = C
        } catch (error) {
            console.error("Error processing document:", error);
        }


        // N Has all my connection request Users.
        // Refined Has everyone from my area in my college.
        //goal is to travel thru each element of refined and see if they are in N, if not then add them
        //in one of the arrays.

        let NoRequestedUsers=[];
        for(let i=0;i<Refined.length;i++){
            let there = false;
            for(let j=0;j<N.length;j++){
                if(N[j]["PosterEmail"] === Refined[i]["email"]){
                    there=true
                }
            }
            if(!there){
                NoRequestedUsers.push(Refined[i]);
            }
        }
        N=null;


        //now i have users who are not me, and not someone who i requested to connect, now i just have to remove
        //those who are already my connection!

        let FinData = []
        for(let i=0;i<NoRequestedUsers.length;i++){
            let there = false;
            for(let j=0;j<BrosConnections.length;j++){
                if(BrosConnections[j] === NoRequestedUsers[i]["email"]){
                    there=true
                }
            }
            if(!there){
                FinData.push(NoRequestedUsers[i]);
            }
        }
    
        RawData.password=""
     
        res.send({ D: FinData,UI:RawData, message: true });
    } catch (error) {
        console.error("Error fetching or processing users:", error);
        res.send({ message: false, error: "Error processing users" });
    }
});



app.post("/ConnectRequest",async(req,res)=>{
    const D = req.body.D
    try {
        const A = await ConReqModel.find({post_id:D.post_id,RequesterEmail:D.RequesterEmail});

        if(A.length > 0){
            res.send({message:"THERE"})
        }else{
            try {
                await ConReqModel.create(D);
                res.send({message:"CREATED"})
            } catch (error) {
                console.log(error)
                res.send({message:"BAD"})
            }
        }
    } catch (error) {
        
    }
    
})


app.post("/conStat",async(req,res)=>{
    const Email = req.body.email
    
    try {
        const D = await ConReqModel.find({"RequesterEmail":Email})

        res.send({message:true,Data:D})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})


app.post("/conDel",async(req,res)=>{
    const id = req.body.PID
    try {
        await ConReqModel.deleteOne({_id:id})
        res.send({message:true})
    } catch (error) {
        console.log(error)
        res.send({message:falsa})
    }
})


app.post("/newCons",async(req,res)=>{
    const Email = req.body.email
    
    try {
        const R = await ConReqModel.find({"PosterEmail":Email})
   
        
        res.send({Data:R,message:true})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})


app.post("/createConnection",async(req,res)=>{
    

    const PostId = req.body.PostId
    try {
        const PostData = await ConReqModel.find({_id:PostId})
        //now that i have this i have to retrive the email of both sender and reciever 
        //and then i gotta add in their connections array my email, and then we delete this request!
        let Email1 = PostData[0].PosterEmail;
        let Email2 = PostData[0].RequesterEmail;

        console.log(Email1,Email2)
   
        await RegisterModel.updateOne(
            { email: Email1 },
            { $push: { Connections: Email2 } }
        );


        await RegisterModel.updateOne(
            { email: Email2 },
            { $push: { Connections: Email1 } }
        );


        await ConReqModel.deleteOne({_id:PostId})

        


        
        res.send({message:true})
    } catch (error) {
        res.send({message:"notok"})
    }
})

app.post("/getMyInfo",async(req,res)=>{
    const Email = req.body.email
    try {
        const Data = await RegisterModel.find({email:Email})
        if(Data.length > 0){
            Data[0].password=""
        }
        res.send({message:true,D:Data[0]})
    } catch (error) {
        res.send({message:false})
        console.log(error)
    }
})


app.post("/deleteConnections",async(req,res)=>{

    const Email1 = req.body.Data.OtherEmail
    const Email2 = req.body.Data.MyEmail
    try {
        await RegisterModel.updateOne(
            { email: Email1 },
            { $pull: { Connections: Email2 } }
        );


        await RegisterModel.updateOne(
            { email: Email2 },
            { $pull: { Connections: Email1 } }
        );
        res.send({message:true})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
    
})


app.post("/Post",async(req,res)=>{
    const Data = req.body.D
    //fetch users info, and then know their college, and their id so that your model looks something like this:
    // {
        // College:,
        // UserId:,
        // An:,
        // Re:,
        // Desc,
        // Course:,
    // }

    let UserData;
    
    try {
        UserData = await RegisterModel.findOne({email:Data.UserEm})
        const FinalData = {
            College:UserData.college,
            UserId:UserData._id.toString(),
            UserName:UserData.name,
            An:Data.Anonymous,
            Re:Data.ReplyPerm,
            Desc:Data.Description,
            Course:UserData.course,
            Img:UserData.selectedImg
        }
        try {
            await PostModel.create(FinalData)
            res.send({message:true})
        } catch (error) {
            res.send({message:!true})
        }

    } catch (error) {
        console.log(error)
        res.send({message:!true})

    }
    
})

app.post("/getcolpost", async (req, res) => {
    const UserEmail = req.body.Em; // Correct reference to the incoming email
    let UserData;

    try {
        // Find the user based on their email
        UserData = await RegisterModel.findOne({ email: UserEmail });


        // Find posts where College matches and UserId is not the same as the user's
        const PostData = await PostModel.find({
            College: UserData.college,
            UserId: { $ne: UserData._id }
        });

       res.send({message:true,D:PostData})
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: false }); // Handle errors
    }
});


app.post("/postReply",async(req,res)=>{
    const Data = req.body.D

    /*
    so few things:
    S1: get users info, to fetch their username and id.
    S2: then just post it in the postModel.
    */

    //finalized dictionary:
    const finalizedData = {
        postId:Data["postId"],
        description:Data["description"],
        userId:null,
        userName:null,
        selectedImg:null,

    }

    //S1

    try {
        const UserData = await RegisterModel.findOne({email:Data["UserEmail"]})
        finalizedData["userId"] = UserData["_id"].toString()
        finalizedData["userName"] = UserData["name"]
        finalizedData["selectedImg"] = UserData["selectedImg"]
    
    } catch (error) {
        console.log(error)
        res.send({message:!true})

    } 

    //S2:

    try {
        await ReplyModel.create(finalizedData);
        res.send({message:true})
    } catch (error) {
        console.log(error)
        res.send({message:!true})
    }
})


app.post("/postfetcher",async(req,res)=>{
    const PID = req.body.PID
    let previous;
    try {
        const p = await ReplyModel.find({postId:PID})
        previous = p;
    } catch (error) {
        console.log(error)
    }
    try {
        const postdata = await PostModel.find({_id:PID})

        res.send({message:true,PreviousData:previous,PostData:postdata})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})

app.post("/AreaPost",async(req,res)=>{
    const Data = req.body.D
    //fetch users info, and then know their college, and their id so that your model looks something like this:
    // {
        // College:,
        // UserId:,
        // An:,
        // Re:,
        // Desc,
        // Course:,
    // }

    let UserData;
    
    try {
        UserData = await RegisterModel.findOne({email:Data.UserEm})
        const FinalData = {
            Area:UserData.area,
            UserId:UserData._id.toString(),
            UserName:UserData.name,
            An:Data.Anonymous,
            Re:Data.ReplyPerm,
            Desc:Data.Description,
            Course:UserData.course,
            Img:UserData.selectedImg
        }
        try {
            await AreaPostModel.create(FinalData)
            res.send({message:true})
        } catch (error) {
            res.send({message:!true})
        }

    } catch (error) {
        console.log(error)
        res.send({message:!true})

    }
    
})



app.post("/getAreaPost", async (req, res) => {
    const UserEmail = req.body.Em; // Correct reference to the incoming email
    let UserData;

    try {
        // Find the user based on their email
        UserData = await RegisterModel.findOne({ email: UserEmail });


        // Find posts where College matches and UserId is not the same as the user's
        const PostData = await AreaPostModel.find({
            Area: UserData.area,
            UserId: { $ne: UserData._id }
        });

       res.send({message:true,D:PostData})
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: false }); // Handle errors
    }
});

app.post("/AreaPostFetcher",async(req,res)=>{
    const PID = req.body.PID
    let previous;
    try {
        const p = await AreaReplyModel.find({postId:PID})
        previous = p;
    } catch (error) {
        console.log(error)
    }
    try {
        const postdata = await AreaPostModel.find({_id:PID})

        res.send({message:true,PreviousData:previous,PostData:postdata})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})


app.post("/AreaPostReply",async(req,res)=>{
    const Data = req.body.D

    /*
    so few things:
    S1: get users info, to fetch their username and id.
    S2: then just post it in the postModel.
    */

    //finalized dictionary:
    const finalizedData = {
        postId:Data["postId"],
        description:Data["description"],
        userId:null,
        userName:null,
        selectedImg:null,
    }

    //S1

    try {
        const UserData = await RegisterModel.findOne({email:Data["UserEmail"]})
        finalizedData["userId"] = UserData["_id"].toString()
        finalizedData["userName"] = UserData["name"]
        finalizedData["selectedImg"] = UserData["selectedImg"]
    } catch (error) {
        console.log(error)
        res.send({message:!true})

    } 

    //S2:

    try {
        await AreaReplyModel.create(finalizedData);
        res.send({message:true})
    } catch (error) {
        console.log(error)
        res.send({message:!true})
    }
})


app.post("/GiveConnectionsInfo", async (req, res) => {
    let ConnectionInfo=[];
    let Connections = req.body.Connections;
    for (let i = 0; i < Connections.length; i++) {
        try {
            let ConnectionInf = await RegisterModel.findOne({ email: Connections[i] });
            
            if (ConnectionInf) {
                let Augmented = {
                    name:ConnectionInf.name,
                    selectedImg:ConnectionInf.selectedImg,
                    _id:ConnectionInf._id,
                    email:ConnectionInf.email
                }
                ConnectionInfo.push(Augmented);
            } else {
                console.log(`No user found for email: ${Connections[i]}`);
            }
        } catch (error) {
             res.send({message:false})
            console.error("Error fetching connection info:", error);
        }
    }
    

    res.send({ message: true, Data: ConnectionInfo }); 
});


app.post("/fetchUserPost",async(req,res)=>{

    let id = req.body.Id
    let AP;
    let CP;
    try {
        const D = await PostModel.find({UserId:id});
        CP = D
        const DD = await AreaPostModel.find({UserId:id});
        AP = DD 
        let finData = {
            AreaPosts: AP,
            CollegePosts:CP
        }
        console.log(finData)
        res.send({message:true,Data:finData})
    } catch (error) {
        res.send({message:false})
    }
})


app.post("/deleteCollegePost",async(req,res)=>{
    const id = req.body.id
    
    try {

        await PostModel.deleteOne({ _id: id })

        res.send({message:true})
    } catch (error) {
        
    }
})
app.post("/deleteAreaPost",async(req,res)=>{
    const id = req.body.id
    
    try {
        await AreaPostModel.deleteOne({ _id: id })
        res.send({message:true})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})


app.post("/arearepliesfetch",async(req,res)=>{
    const id = req.body.id
    console.log(id)
    try {
        const D = await AreaReplyModel.find({postId:id})
        console.log(D)
        res.send({message:true,Data:D})
    } catch (error) {
        console.log(error)
        res.send({message:false})
    }
})
app.listen(9090)

