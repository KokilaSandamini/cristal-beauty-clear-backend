import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import { OTP } from "../models/otp.js";
dotenv.config()

const transport = nodemailer.createTransport({
	service : "gmail",
	host : "smtp.gmail.com",
	port : 587,
	secure : false,
	auth : {
		user : "sandaminikokila26@gmail.com",
		pass: 
	}, 
})
export function saveUser(req, res) {

	if(req.body.role == "admin"){
		if(req.user==null){
			res.status(403).json({
				message: "Please login as admin before creating an admin account",
			});
			return;
		}
		if(req.user.role != "admin"){
			res.status(403).json({
				message: "You are not authorized to create an admin account",
			});
			return;
		}
	}

	const hashedPassword = bcrypt.hashSync(req.body.password, 10);
	const user = new User({
		email: req.body.email,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		password: hashedPassword,
		role : req.body.role,
	});





	user
		.save()
		.then(() => {
			res.json({
				message: "User saved successfully",
			});
		})
		.catch((err) => {
	console.error("User save error:", err); // <-- show detailed error
	res.status(500).json({
		message: "User not saved",
	});
});
}
export function loginUser(req, res) {
	const email = req.body.email;
	const password = req.body.password;

	User.findOne({
		email: email,
	}).then((user) => {
		if (user == null) {
			res.status(404).json({
				message: "Invalid email",
			});
		} else {
			const isPasswordCorrect = bcrypt.compareSync(password, user.password);
			
			//check for user.isDisabled
			//check for invalid attempts
			//if invalid attempts > 3 AND user.blockUntil > Date.now() res
			
			if (isPasswordCorrect) {
				
				const userData = {
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					phone: user.phone,
					isDisabled: user.isDisabled,
					isEmailVerified: user.isEmailVerified
				}
				console.log(userData)

				const token = jwt.sign(userData,process.env.JWT_KEY,{
					expiresIn : "48hrs"
				})

				res.json({
					message: "Login successful",
					token: token,
					user : userData
				});


			} else {
				res.status(403).json({
					message: "Invalid password",
				});
				//user -> blockUntil = Date.now() + 5*60*1000
				//user -> inValidAttempts = default=0 +1
				//if(user.inValidAttempts > 3){
				//	user.isDisabled = true
				//
			}
		}
	});
}

export async function googleLogin(req,res){
	const accessToken = req.body.accessToken;

	try{
		const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
			headers : {
				Authorization : "Bearer " + accessToken
			}
		})
		
		const user = await User.findOne({
			email : response.data.email
		})
		if(user == null){
			const newUser = new User({
				email : response.data.email,
				firstName : response.data.given_name,
				lastName : response.data.family_name,
				isEmailVerified : true,
				password : accessToken
			})

			await newUser.save()

			const userData = {
				email : response.data.email,
				firstName : response.data.given_name,
				lastName : response.data.family_name,
				role : "user",
				phone : "Not given",
				isDisabled : false,
				isEmailVerified : true
			}

			const token = jwt.sign(userData,process.env.JWT_KEY,{
				expiresIn : "48hrs"
			})

			res.json({
				message: "Login successful",
				token: token,
				user : userData
			});
			
		}else{
			const userData = {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				phone: user.phone,
				isDisabled: user.isDisabled,
				isEmailVerified: user.isEmailVerified
			}

			const token = jwt.sign(userData,process.env.JWT_KEY,{
				expiresIn : "48hrs"
			})

			res.json({
				message: "Login successful",
				token: token,
				user : userData
			});
		}
	}catch(e){
		res.status(500).json({
			message : "Google login failed"
		})
	}

}
export function getCurrentUser(req,res){
	if(req.user == null){
		res.status(403).json({
			message: "Please login to get user details",
		});
		return;
	}
	res.json({
		user : req.user
	})
} 
export async function sendOTP(req,res){
	const email =req.body.email;
	const otp= Math.floor(Math.random()*9000) + 1000;

	const message = {
		from : "sandaminikokila26@gmail.com",
		to : email,
		subject : "OTP for email verification",
		text : "Your OTP is : "+otp
	}

	const newotp = new OTP({
		email : email,
		otp : otp
	})

	newotp.save().then(()=>{
		console.log("OTP saved successfully")
	})

	transport.sendMail(message,(err,info)=>{
		if(err){
			console.log(err);
			res.status(500).json({
				message : "Error sending email"
			})
		}else{
			res.json({
				message : "OTP sent successfully",
				otp : otp
			})
		}
	})
}

export async function changePassword(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const otp = req.body.otp;

    try {
        // Get latest OTP from DB
        const lastOTPData = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

        if (!lastOTPData) {
            return res.status(404).json({ message: "No OTP found for this email" });
        }

        if (lastOTPData.otp != otp) {
            return res.status(403).json({ message: "Invalid OTP" });
        }

        // Hash the new password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Update password in User collection
        await User.findOneAndUpdate(
            { email: email },
            { password: hashedPassword }
        );

        // Delete all OTPs for this user (optional but recommended)
        await OTP.deleteMany({ email: email });

        return res.json({ message: "Password changed successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error changing password" });
    }
}
