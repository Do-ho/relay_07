const sequelize = require("../util/database");
const User = require("../models/user");

exports.getUser = async (req, res, next) => {
    const { userId, name , email, thumbnailURL } = req.body;
    if(userId === null) {
        res.redirect("/");
    } else {
        res.render("/updateUser", { // updateUser를 가입페이지로 변경
            name,
            email,
            thumbnailURL
        });
    }
  };
  
exports.postUpdateUser = async (req, res, next) => {
    const { id, name, email, cur_password, edit_password } = req.body;
    try {
        let user = await User.findByPk(id); 
        const isMatch = await bcrypt.compare(cur_password, user.password);
        if (isMatch) {
            const hashedPassword = await bcrypt.hash(cur_password, 12);
            if(edit_password!==undefined) hashedPassword = await bcrypt.hash(edit_password, 12);
            await user.update({ 
                name: name,
                email : email,
                password : hashedPassword
            });
        }else{
            res.render("mypage/success",{
                success : false
            });
        }
        res.redirect("/posts");
    } catch (err) {
      console.log(err);
      res.redirect("/posts");
    }
  };
  
  exports.updateThumbnail = async (req, res) => {
      const { userId, newThumbnail } = req.body;
      try{
        await sequelize.query(`UPDATE user SET thumbnail=${newThumbnail} WHERE id=${userId}`);
        console.log("썸네일 변경!");
        return res.json({
            success:true
        });
      }catch(err){
          console.log(err);
          res.redirect('/');
      }
  }

  exports.getThumbnail = async (req, res) => {
   const { userId } = req.body;
   try{       
       await User.findOne({
           where: {
               id: userId
           }
       }).then(result => {
           return res.json({
               success : true, 
               thumbnailURL : result.dataValues.thumbnailURL
            });
       }).catch(err => {
           return res.json({
               success : false, 
               message : err
            });
       });
   }catch(e) {
        console.log(e);
        return res.json({success:false, message:e}); 
   };
  }