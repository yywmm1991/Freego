var mongoose = require('mongoose');
var Schema = mongoose.Schema

var Blogschema = new Schema({
    title:{ type:String },
    content:{ type:String },
    author_name:{ type:String  },
    top:{ type:Boolean, default:false },
    reply_count:{ type:Number, default:0 },
    visit_count:{ type:Number, default:0 },
    collect_count:{ type:Number, default:0 },
    create_at:{ type:String },
    update_at:{ type:String },
    last_reply:{ type:Schema.ObjectId },
    last_reply_at:{ type:Date, default:Date.now },
    comments: { type:Array },
    images: { type:Array},
});

mongoose.model('Blog', Blogschema);
