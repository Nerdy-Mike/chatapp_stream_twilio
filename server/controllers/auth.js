const crypto = require('crypto')
const { connect } = require('getstream')
const bcrypt = require('bcrypt')
const StreamChat  = require('stream-chat').StreamChat
require('dotenv').config();


const api_key = process.env.STREAM_API_KEY
const api_secret = process.env.API_SECRET
const app_id = process.env.APP_ID


const signup = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber } = req.body
        
        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key, api_secret);
        const { users } = await client.queryUsers({ name: username });
        if ( users.some(el => el.name === username ) ) return res.status(500).json({ message: 'Username existed' });

        const userId = crypto.randomBytes(16).toString("hex")             // Create random string from 16 hex digits

        const hashedPassword = await bcrypt.hash(password, 10)         // 10 is the cost ( level of encryption)

        const token = serverClient.createUserToken(userId)              //? So will the token be the same with same user input? -> yes it is, which is not ideal


        res.status(200).json({ token, fullName, username, userId, hashedPassword, phoneNumber, users})
    }catch (error){
        console.log(error)
        res.status(500).json({ message : error})
    }
}

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const serverClient = connect(api_key, api_secret, app_id);
        const client = StreamChat.getInstance(api_key, api_secret);

        const { users } = await client.queryUsers({ name: username });

        if(!users.length) return res.status(400).json({ message: 'User not found' });

        const success = await bcrypt.compare(password, users[0].hashedPassword);            

        const token = serverClient.createUserToken(users[0].id);

        if(success) {
            res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id});
        } else {
            res.status(500).json({ message: 'Incorrect password' });
        }
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: error });
    }
};


module.exports = {signup, login}